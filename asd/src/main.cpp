#include <Arduino.h>
#include "motor_driver.h"
#include "position.h"
#include "command.h"
#include "data_structures.h"
#include "rover.h"
#include "control.h"
#include "radar.h"
#include "auto_drive.h"

#define RXP1 17
#define TXP1 16
QueueHandle_t commandQueue;
QueueHandle_t networkQueue;
Robojax_L298N_DC_motor motor(4, 27, 14, 0, 26, 25 , 33, 1);
Rover rover;
Position position(&rover);
Control control(&rover, &motor);
Explore autoDrive(&control, &rover, &networkQueue);
void secondCore(void * parameter)
{
  Command command(true);
  command.connectWifi("RangeRover", "12345678");
  command.connectToServer("13.40.107.144", 3000);
  Radar radar;
    radar.setup();
  DriveMode lastDrive = driveStop;
  for(;;)
  {
    unsigned long network = millis();
    DriveMode current = command.postData((int)rover.xpos, (int)rover.ypos);
    Cmd c;
    bool send = false;
    float data;
    
    if(current == driveManual)
    {
       Directions d = command.getDriveManual();
       if(d != c.direction)
       {
          c.direction = d;
          send = true;
       }
    }
    else if(current == driveDirected)
    {
       int x = command.getDriveCordX();
       if(x != c.X)
       {
         c.X = x;
         send = true;
       }
       int y = command.getDriveCordY();
       if(y != c.Y)
       {
         c.Y = y;
         send = true;
       }

    }
    if(current != lastDrive)
    {
      
      c.driveMode = current;
      lastDrive = current;
      send = true;
      
    }
    if(command.getVelocity() * 10 != c.velocity)
    {
      c.velocity = command.getVelocity() * 10;
      send = true;
    }
    if(send == true)
    {
        xQueueSend(commandQueue, &c, 10);
        send = false;
    }
    if(uxQueueMessagesWaiting(networkQueue) != 0)
    {
      PointOfInterest c;
      xQueueReceive(networkQueue, &c, 10);
      command.sendObject(&c);
    }
    Serial.println("Server took: " + String(millis()-network));
    unsigned long starttime = millis();
    /*for(int i = 0; i < 1000; i++)
      radar.loop();
    if(radar.getFanDetect())
    {
      Serial.println("Fan detected, amplitude: " + String(radar.getAvarageAmplitude()));
      data = radar.getAvarageAmplitude();
      
    }
    Serial.println("Radar took: " + String(millis()-starttime));
    */
    vTaskDelay(1);
  }
}
void OnGetting()
{
  String damn;
  damn = String(Serial1.read());
  
  Serial.println(damn);
}
Cmd currentCom;

void getaroundobstacle(int &obstacles, float traversal){

  rover.rotateto(rover.angleFacing + 90);
  rover.movefwdx(traversal);
  //


  rover.rotateto(rover.angleFacing - 90);
  //if 
  if(obstacles){

  }
}

void setup()
{
  Serial1.begin(115200, SERIAL_8N1, RXP1, TXP1);
  //Serial1.onReceive(OnGetting, true);
  position.setupPostion();
  
  Serial.begin(115200);
  position.Callibrate(1000);
  commandQueue =  xQueueCreate(2, sizeof(Cmd));
  
  if(commandQueue == NULL)
    Serial.println("Error, command queue creation failed");
  networkQueue = xQueueCreate(2, sizeof(PointOfInterest));
  if(networkQueue == NULL)
    Serial.println("Error, creating network queue");
  
  control.setup();
  autoDrive.inistializeAuto(3000,3000);
  position.Callibrate(1000);
  //xTaskCreatePinnedToCore(secondCore, "Network", 10000, NULL, 1, NULL, 0);
  delay(1000);
   

 

}



unsigned long lastPrint = 0;
unsigned long loopTime = 0;
int speed = 0;
void loop()
{
  loopTime = millis();
  
  position.updatePosition();
  if(uxQueueMessagesWaiting(commandQueue) != 0)
  {
    xQueueReceive(commandQueue, &currentCom, 10);
    control.setStateToDefault();
  }
  if(Serial1.available())
  {
    //String damn = String((char)Serial1.read());
    Serial.println(Serial1.read());
  }
  //control.fullcontroller(1000,0,500,1000);
  
  
  /*switch(currentCom.driveMode)
  {
    case driveStop:
    motor.brake(motor1);
    motor.brake(motor2);
    break;
    case driveDirected:
    control.fullcontroller(currentCom.X, currentCom.Y, 10, 10);
    break;
    case driveManual:
    control.manual_control(currentCom.direction, currentCom.velocity);
    break;
    case driveAuto:
    //autoDrive.update(currentCom.velocity);
    motor.brake(motor1);
    motor.brake(motor2);
    break;
  }*/
  if(millis()-loopTime < 15)
    delay(15-(millis()-loopTime));

}




