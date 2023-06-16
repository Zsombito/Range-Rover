
#ifndef control_h
#define control_h

#include "PID.h"
#include "motor_driver.h"
#include "rover.h"
#include "SPI.h"
#include <Arduino.h>
#include "command.h"
#include "vector"
//Motor setup:
#define CHA 0 // 
#define ENA 14 
#define IN1 4
#define IN2 27
#define CHB 1
#define ENB 33
#define IN3 26
#define IN4 25
#define motor1 1//right
#define motor2 2//left
class Control
{
    
private:
Robojax_L298N_DC_motor *motor;
Rover *rover;
GoToDest cstate;;
const float L = 175.0F;
float  v_linear = 1;
float  pwm_right, pwm_left; 
float  v_right, v_left;
float destDegree; 
float  vel_r_d, vel_l_d;
float vel_max = 3.80F;
float vel_min = 0.65F;
PIDController w_pid = {25.0F, 0.0F, 0.0F, 0.0F, -1.56F,1.56F, -1.56F,1.56F,20.0F}; // Kp_w, Ki_w, Kd_w, tau_w, lim_min_w,lim_max_w,lim_min_int_w,lim_max_int_w,T_w
PIDController vl_pid = {12.0F, 0.001F, 0.001F, 0.0F, -100.0F,100.0F,-500.0F,500.0F,10}; // Kp_vl, Ki_vl, Kd_vl, tau_vl, lim_min_vl,lim_max_vl,lim_min_int_vl,lim_max_int_vl,T_vl
PIDController vr_pid = {12.0F, 0.001F, 0.001F, 0.0F, -100.0F,100.0F,-500.0F,500.0F,10}; // Kp_vl, Ki_vl, Kd_vl, tau_vl, lim_min_vl,lim_max_vl,lim_min_int_vl,lim_max_int_vl,T_vl
int gpiotoint(int a, int b, int c){
  return (a * 4) + (b*2) + (c*1);
}
float computTheta_d(float realx , float realy , float x_goal, float y_goal)
{
  //vector between th
  float m_x; 
  float m_y; 
  m_x =  x_goal-realx;
  m_y =  y_goal- (realy);
  if(pow(m_x, 2) + pow(m_y, 2) < 2500)
    return rover->angleFacing;
  else
    return atan2(m_y,m_x); 
}
public:
void angularCtrl(float degree, float  v_d)
{
  float theta_d = degree;
  if(theta_d < -3.14F)
    theta_d += 6.28F;
  else if(theta_d > 3.14F)
    theta_d -= 6.28F;
  float w_d = PIDController_Update(&w_pid,theta_d,rover->angleFacing); // put - infront of position
  float v_right_d = v_d/33.0F + w_d*2.65F;
  float v_left_d =  v_d/33.0F - w_d*2.65F;
  v_right = rover->velocity/33.0F + rover->angularVelocity*2.65F;
  v_left  = rover->velocity/33.0F - rover->angularVelocity*2.65F;
  float pwmr = PIDController_Update(&vr_pid,v_right_d,v_right);
  float pwml = PIDController_Update(&vl_pid,v_left_d,v_left);
  valid_w(&pwmr, &pwml, v_d);
  motor->rotate(motor2,abs(pwmr),(v_right_d < 0));// motor2 is right 
  motor->rotate(motor1,abs(pwml),(v_left_d < 0)); // motor 1 is left changed from < to >
  if(millis() - lastprint >= 200)
  {
    Serial.println("thetad " + String(theta_d));
    Serial.println("X=" +String(rover->xpos) + "Y=" + String(rover->ypos));
    Serial.println("Angle: " + String(rover->angleFacing));
    Serial.println("pwml " + String(pwml));
    Serial.println("pwmr " + String(pwmr));
    lastprint = millis();
  }

}
float distanceCtrl(float x, float y, float k, float v){
  float distancex = fabs(x - rover->xpos);
  float distancey = fabs(y - rover->ypos);
  float distance = sqrt(pow(distancex,2) + pow(distancey,2));
  float vdes = k * distance;
  if(v < vdes)
    return v;
  else
    return vdes;
}
bool fullcontroller(float x, float y, float v,float k)
{
  switch (cstate)
  {
    case Initialize:
      destDegree = computTheta_d(rover->xpos, rover->ypos, x, y);
      cstate = RotateToDeg;
      return false;
    case RotateToDeg:
      Serial.println("I'm correcting degree: " + String(rover->angleFacing) + " -> " + String(destDegree));
      if(abs(rover->angleFacing - destDegree) > 0.01F)
        angularCtrl(destDegree, 0.0F);
      else
        cstate = MoveStraight;
      return false;
    case MoveStraight:
      Serial.println("I'm moving towards target with speed: " + String(distanceCtrl(x,y,k,v)) + ", current pos: " + String(rover->xpos) + ", " + String(rover->ypos));
      if((abs(x - rover->xpos) > 15) || (fabs(y - rover->ypos) > 15))
        angularCtrl(destDegree, distanceCtrl(x,y,k,v));
      else
        cstate = Reached;
      if(abs(computTheta_d(rover->xpos, rover->ypos, x, y) - destDegree) > 0.5F)
        cstate = Initialize;
      return false;
    case Reached:
      motor->brake(motor1);
      motor->brake(motor2);
      Serial.println("Reached: " + String(rover->xpos) + ", " + String(rover->ypos));
      return true;
    default:
      return false;
  }
  
}
void valid_w(float *pwm_r ,float *pwm_l, float v_d){

  float pl = abs(*pwm_l);
  float pr = abs(*pwm_r);

  
  if(abs(v_d) > 0){//if there is linear speed


// if we want to improve the code we can set the limit individually and not assume that both motor have the same max velocity
float pwm_rl_max = max(pl, pr);
float pwm_rl_min = min(pl, pr);

if( pwm_rl_max> 75.0F){
pr = pr- (pwm_rl_max -75);
pl = pl - (pwm_rl_max -75);
}
else if( pwm_rl_min < 20.0F){
pr = pr + (20.0F-pwm_rl_min);
pl = pl + (20.0F-pwm_rl_min);
}
// else do nothing
// since the limitation is compute using the absolute value we need to make sure to return the sign value:
//sign function for w_d
}
else
{
  pr = max(min(pr, 75.0F), 30.0F) ;
  pl = max(min(pl, 75.0F), 30.0F) ;
}
*pwm_r = pr;
*pwm_l = pl;
}
void setup()
{
    motor->begin();
    PIDController_Init(&w_pid);
    PIDController_Init(&vl_pid);
    PIDController_Init(&vr_pid);
    
}
Control(Rover *r, Robojax_L298N_DC_motor *m)
{
    rover = r;
    motor = m;
}
void manual_control(Directions ctrl, int speed)
  {

  switch (ctrl)
  {
  case Stop:
    //stop
    motor->brake(motor1);
    motor->brake(motor2);
    break;
  
  case Forwards:
    //fwd
    Serial.println("fwd: " + String(speed));
    angularCtrl(destDegree, speed);
    break;
  
  case Backwards:
    //reverse
    motor->rotate(motor1,speed/4,1);
    motor->rotate(motor2,speed/4,1);
    break;
  
  case Left:
    //left
    angularCtrl(rover->angleFacing + 10.0F, 0.0F);
    break;
  
  case Right:
    //right
    angularCtrl(rover->angleFacing - 10.0F, 0.0F);
    break;

  default:
    break;
  }
}
void setStateToDefault(){cstate = Initialize; destDegree = rover->angleFacing;}
float getDestDegree(){return destDegree;}
};


#endif