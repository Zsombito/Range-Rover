#ifndef rover_h
#define rover_h

#include <iostream>
#include <cmath>
#include <vector>
#include <string>
#include <map>
#include <data_structures.h>

//given a distance and an angle and a position calculate the new position



class Rover{
  protected: 
    
    std::map<std::string,std::pair<float,float>> ballsnpos;
    
  public:
    float xpos, ypos, angleFacing, velocity, angularVelocity;
    std::vector<PointOfInterest> mapped;
    //default constructor
    Rover(){
      xpos = 0.0;
      ypos = 0.0;
      angleFacing = 0.0;
      velocity = 0.0;
      angularVelocity = 0.0;
    }
    Rover(float x, float y, float angle){
      xpos = x;
      ypos = y;
      angleFacing = angle;
    }
    Rover(float angle, float distance){
    //given a distance, angle, and prev xy, calc new position
      xpos = xpos + (distance*cos(angle)); 
      ypos = ypos + (distance*sin(angle)); 
      angleFacing = angle;
    }

    void movetoxy(float x,float y){
        
    }

    void rotateto(float thetadesired){
      // should use the ctrller to rotate to an angle
    }

    void movefwdx(float distance){
      //use the ctrller to move straight this distance
      
    }

    
};

#endif