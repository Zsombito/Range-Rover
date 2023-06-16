#ifndef auto_drive_h
#define auto_drive_h

#include <Arduino.h>
#include "control.h"


class Explore
{
private:
Control *control;
bool obstacleFlag, ballsFlag;
float startDegree = -0.1F;
Color chosenOne;
std::map<Color, Visual> balls;
std::vector<Obs> obstacles;
std::vector<std::pair<float,float>> pointsToCheck;
float savedAngles;
std::pair<float,float> goals;
QueueHandle_t *radar;
State state, previousState;
Rover *rover;
String vis;
QueueHandle_t *networkQueue;
int boundryX, boundryY;
void executeStateMachine(int Speed)
{
    switch (state)
    {
        case Rotate360:
            if(fabs(startDegree - rover->angleFacing) > 0.04F)
                 control->angularCtrl(rover->angleFacing + 0.10F, 0.0F);
            else
            {
                pointsToCheck.erase(pointsToCheck.begin());
                control->setStateToDefault();
                state = GoingToDest;
            }
            break;
        case GoingToDest:
            if(control->fullcontroller(pointsToCheck[0].first, pointsToCheck[0].second, 10, 10))
                state = Rotate360;
            break;
        case BallControl:
            control->manual_control(balls[chosenOne].direction, Speed);
            if(balls[chosenOne].direction == Stop)
            {
                balls[chosenOne].isMaped = true;
                PointOfInterest p;
                p.color = chosenOne;
                p.posX = balls[chosenOne].distance * cos(rover->angleFacing) + rover->xpos;
                p.posY = balls[chosenOne].distance * sin(rover->angleFacing) + rover->ypos;
                p.type = Balls;
                xQueueSend(*networkQueue, &p, 10);
                Obs o(rover->xpos + sin(rover->angleFacing)*balls[chosenOne].distance, rover->ypos + cos(rover->angleFacing)*balls[chosenOne].distance);
                obstacles.push_back(o);
                control->setStateToDefault();
                state = previousState;
            }
            break;
        case FanControl:
            break;
        case ObsticleAvoidence:
            if(control->fullcontroller(goals.first, goals.second, 10,10))
            {
                if(fabs(savedAngles-rover->angleFacing) > 0.01F)
                    control->angularCtrl(savedAngles, 0.0F);
                else
                {
                    control->setStateToDefault();
                    state = previousState;
                }
            }
            break;


    }
}
public:
Explore(Control *c, Rover *r, QueueHandle_t *q)
{
    control = c;
    rover = r;
    networkQueue = q;
}
void update(int Speed)
{
    
    if(ballsFlag)
    {
        std::map<Color, Visual>::iterator it;
        int max = 10000;
        for(it = balls.begin(); it != balls.end(); it++)
        {
            if(!it->second.isMaped && it->second.distance != -1 && it->second.distance < max)
            {
                chosenOne = it->first;
                max = it->second.distance;
                previousState = state;
                state = BallControl;
            }
        }
        if(max == 10000)
            state = previousState;
    }
    if(obstacleFlag)
    {
        for(int i = obstacles.size() - 1; i >= 0; i--)
        {
            if(abs(cos(rover->angleFacing) * (rover->ypos - obstacles[i].centerY) - sin(rover->angleFacing) * (rover->xpos - obstacles[i].centerX)) < 20 + obstacles[i].width / 2 && obstacles[i].getSquareDistance(rover->xpos, rover->ypos) < 10000)
            {
                if(state != BallControl)
                    previousState = state;
                if(state != ObsticleAvoidence)
                {
                    savedAngles = rover->angleFacing;
                    goals.first = rover->xpos + cos(savedAngles + PI) * 50;
                    goals.second = rover->ypos + sin(savedAngles + PI) * 50;
                }
                else if(abs(savedAngles - rover->angleFacing) > PI/2 - 0.05F && state == ObsticleAvoidence)
                {
                    goals.first = rover->xpos + cos(savedAngles + PI) * 50;
                    goals.second = rover->ypos + sin(savedAngles + PI) * 50;
                }
                control->setStateToDefault();
                state = ObsticleAvoidence;
                break;
            }
        }
    }
    if(rover->xpos < 0 || rover->ypos < 0 || rover->ypos > boundryY || rover->xpos > boundryX)
    {
        //Bug out!
       state = GoingToDest; 
    }
}

void visualUpdate(Visual newVis)
{
    if(newVis.distance < 0)
    {
        balls[newVis.color] = newVis;
        ballsFlag = true;
    }
    else if(newVis.color != ObstacleC)
    {
        if(!balls[newVis.color].isMaped)
        {
            balls[newVis.color] = newVis;
        }
        else if(balls[newVis.color].direction == Forwards || balls[newVis.color].direction == Backwards)
            obstacleFlag = true;
    }
    else
    {
        Obs *obs;
        if(newVis.direction == Forwards)
        {
            obs = new Obs(rover->xpos, rover->ypos, rover->angleFacing, newVis.distance, newVis.width);
            obstacleFlag = true;
        }
        else if(newVis.direction == Left)
        {
            obs = new Obs(rover->xpos, rover->ypos, rover->angleFacing + 0.10, newVis.distance, newVis.width);
            if(newVis.direction < 30)
                obstacleFlag = true;
        }
        else 
        {
            obs = new Obs(rover->xpos, rover->ypos, rover->angleFacing - 0.10, newVis.distance, newVis.width);
            if(newVis.direction < 30)
                obstacleFlag = true;
        }
        bool isDuplacete = false;
        for(int i = obstacles.size() - 1; i >= 0; i--)
        {
            if(abs(obstacles[i].centerX - obs->centerX) < (obs->width + obstacles[i].width) / 2 && abs(obstacles[i].centerY - obs->centerY) < (obs->width + obstacles[i].width) / 2)
            {
                isDuplacete == true;
                obstacles.erase(obstacles.begin() + i - 1);
                obstacles.push_back(*obs);
                break;
            }
        }
        if(isDuplacete == false)
        {
            obstacles.push_back(*obs);
            PointOfInterest p;
            p.type = Obstacles;
            p.posX = obs->centerX;
            p.posY = obs->centerY;
            xQueueSend(*networkQueue, &p, 10);
        }
    }
}
void inistializeAuto(int height, int width)
{
    boundryY = height;
    boundryX = width;
    pointsToCheck.push_back(std::pair<float,float>(3 * boundryX / 4, 3 * boundryY / 4));
    pointsToCheck.push_back(std::pair<float,float>(3 * boundryX / 4, 1 * boundryY / 4));
    pointsToCheck.push_back(std::pair<float,float>(1 * boundryX / 4, 3 * boundryY / 4));
    pointsToCheck.push_back(std::pair<float,float>(1 * boundryX / 4, 1 * boundryY / 4));
    pointsToCheck.push_back(std::pair<float,float>(boundryX / 2, boundryY / 2));
}

};


#endif