
#ifndef command_h
#define command_h

#include <WiFi.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include "data_structures.h"

class Command
{
private:
    HTTPClient httpSender;
    HTTPClient httpReciever;
    String ipaddress, lastDriveMode, instruction;
    int port, goalX, goalY, manualFlag;
    int velocity;
    unsigned long sendTimer;
    bool debug = false;
    
    DriveMode getCommandManual()
    {
        if (millis() - sendTimer >= 10)
        {
            httpReciever.POST("manual");
            instruction = httpReciever.getString();
        }
        if(debug)
                Serial.println("Got manual instruction of: " + String(instruction));
        DynamicJsonDocument doc(2048);
        deserializeJson(doc, instruction);
        if(doc["drivemode"] == "fullmanual")
        {
            manualFlag = int(doc["method"]);
            return driveManual;
        }
        else
        {
            String s = doc["method"];
            goalX = s.substring(0, s.indexOf(',')).toInt();
            goalY = s.substring(s.indexOf(',') + 1).toInt();
            return driveDirected;
        }
        
    }
   
public:
    Command(bool Debug)
    {
        debug = Debug;
    }
    Command()
    {
        debug = false;
    }
    DriveMode postData(int posX, int posY)
    {
        StaticJsonDocument<200> doc;
        
        doc["table"] = "Position";
        doc["x_pos"] = posX;
        doc["y_pos"] = posY;
        doc["time"] = (int)millis();
        
        String requestString;
        serializeJson(doc, requestString);
        unsigned long ht = millis();
        if (debug)
        {
            Serial.println("Sending data: " + requestString);
            Serial.println(httpSender.errorToString(httpSender.POST(requestString)));
        }
        else
            httpSender.POST(requestString);
        String response = httpSender.getString();
        
        DynamicJsonDocument ins(2048);
        deserializeJson(ins, response);
        
        if(debug)
            Serial.println("Driving mode: " + response);
        velocity = (int)float(ins["velocity"]);
        if (ins["drive"] == "auto")
        {
            lastDriveMode = response;
            return driveAuto;
        }
        else if(ins["drive"] == "man")
        {
            if(lastDriveMode != response)
            {
                lastDriveMode = response;
            }
            return getCommandManual();
        }
        else
        {
            return driveStop;
        }
        Serial.println("Http took: " + String(millis() - ht));
    }
    void sendObject(PointOfInterest *c)
    {
        StaticJsonDocument<200> doc;
        switch (c->type)
        {
        case Vents:
            doc["obstacle"] = "Fan";
            break;
        
        case Balls:
            doc["obstacle"] = "Alien";
            switch (c->color)
            {
                case Red:
                doc["colour"] = "FF0000";
                break;
                case Blue:
                doc["colour"] = "FF0000";
                break;
                case Green:
                doc["colour"] = "FF0000";
                break;
                case Pink:
                doc["colour"] = "FF0000";
                break;
            }
            break;
        case Obstacles:
            doc["obstacle"] = "Build";
            break;
        }
        doc["table"] = "Obstacles";
        doc["x_pos"] = c->posX;
        doc["y_pos"] = c->posY;
        doc["time"] = (int)millis();
        String requestString;
        serializeJson(doc, requestString);
        httpSender.POST(requestString);
        String response = httpSender.getString();

      
    }
    bool connectWifi(const char * SSID,const char * PASSWORD)
    {
        unsigned long connectionTimout = millis();
        Serial.println("Trying wifi connection!");
        WiFi.mode(WIFI_STA);
        WiFi.begin(SSID, PASSWORD);
        Serial.print("Connection to wifi...");
        while (WiFi.status() != WL_CONNECTED && millis() - connectionTimout <= 1000)
        {
            Serial.print('.');
            delay(1000);
        }
        Serial.println("");
        Serial.println(WiFi.localIP());
        return WiFi.status() == WL_CONNECTED;
    }
    bool connectToServer(String IP, int PORT)
    {
        if(debug)
            Serial.println("Connecting to server!");
        ipaddress = IP;
        port = PORT;
        bool f = httpSender.begin(ipaddress, port, "/rcv");
        if (f == true)
            httpSender.addHeader("Content-Type", "application/json");
        httpReciever.begin(IP, PORT, "/drive/manual/inst");
        return f;
    }
    int getDriveCordX() { return goalX; }
    int getDriveCordY() { return goalY; }
    int getVelocity(){return velocity;}
    Directions getDriveManual() {
        switch (manualFlag)
        {
        case 0:
            return Stop;
            break;
        case 1:
            return Forwards;
            break;
        case 2:
            return Backwards;
        case 3:
            return Right;
        case 4:
            return Left;
        default:
            return Stop;
        }
     }
};


#endif