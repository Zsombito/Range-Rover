
#ifndef data_structures_h
#define data_structures_h



enum DriveMode
  {
    driveAuto = 0,
    driveManual = 1,
    driveDirected = 2,
    driveStop = 3
  };
enum GoToDest
{
  Initialize,
  RotateToDeg,
  MoveStraight,
  Reached
};
enum Directions
{
    Forwards,
    Backwards,
    Right,
    Left,
    Stop,
    Obstacle
};
enum State{
  Rotate360 = 0,
  BallControl = 1,
  FanControl = 2,
  GoingToDest = 3,
  ObsticleAvoidence = 4
};
enum Object{
  Vents = 0,
  Balls = 1,
  Obstacles = 2
};
enum Color{
  Red,
  Green,
  Blue,
  Pink,
  ObstacleC
};
struct Visual
{
  Color color;
  Directions direction;
  int distance;
  int width;
  bool isMaped;
};
struct Cmd{
  DriveMode driveMode;
  Directions direction;
  int X;
  int Y;
  int velocity;
};
struct Obs
{
  int width;
  int centerX;
  int centerY;
  Obs(int cX, int cY)
  {
     width = 50;
     centerX = cX;
     centerY = cY;

  }
  Obs(int posX, int posY, float angle, int distance, int WIDTH)
  {
    int offsetX = distance * sin(angle);
    int offsetY = distance * cos(angle);
    centerX = posX + offsetX + WIDTH/2;
    centerY = posY + offsetY + WIDTH/2;
    width = WIDTH;
    
  }
  int getSquareDistance(int posX, int posY)
  {
    return (centerY-posY)*(centerY-posY) + (centerX-posX)*(centerX-posX);
  }
  /*std::pair<float,float> getAngleBlock(int posX, int posY)
  {
    
    float angle1 = atan2(c1Y-posY, c1X - posX) + PI;
    float angle2 = atan2(c2Y-posY, c2X - posX) + PI;
    float angle3 = atan2(c3Y-posY, c3X - posX) + PI;
    float angle4 = atan2(c4Y-posY, c4X - posX) + PI;
    //return std::pair<float,float>(min(angle1, angle2, angle3, angle4), max(angle1, angle2, angle3, angle4)); <- fix it later, 

  } */
  
  
};
struct PointOfInterest{
  Object type;
  Color color;
  float posX;
  float posY;
  
};

    
    

#endif