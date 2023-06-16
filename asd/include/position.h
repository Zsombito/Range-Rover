
#ifndef optical_sensor_h
#define optical_sensor_h

#include "SPI.h"
#include <Arduino.h>
#include "rover.h"
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>



#define PIN_SS        17


#define PIN_MISO      19
#define PIN_MOSI      23    
#define PIN_SCK       18
#define PIN_LED1       21
#define PIN_MOUSECAM_RESET     35
#define PIN_MOUSECAM_CS        5

#define ADNS3080_PIXELS_X                 30
#define ADNS3080_PIXELS_Y                 30

#define ADNS3080_PRODUCT_ID            0x00
#define ADNS3080_REVISION_ID           0x01
#define ADNS3080_MOTION                0x02
#define ADNS3080_DELTA_X               0x03
#define ADNS3080_DELTA_Y               0x04
#define ADNS3080_SQUAL                 0x05
#define ADNS3080_PIXEL_SUM             0x06
#define ADNS3080_MAXIMUM_PIXEL         0x07
#define ADNS3080_CONFIGURATION_BITS    0x0a
#define ADNS3080_EXTENDED_CONFIG       0x0b
#define ADNS3080_DATA_OUT_LOWER        0x0c
#define ADNS3080_DATA_OUT_UPPER        0x0d
#define ADNS3080_SHUTTER_LOWER         0x0e
#define ADNS3080_SHUTTER_UPPER         0x0f
#define ADNS3080_FRAME_PERIOD_LOWER    0x10
#define ADNS3080_FRAME_PERIOD_UPPER    0x11
#define ADNS3080_MOTION_CLEAR          0x12
#define ADNS3080_FRAME_CAPTURE         0x13
#define ADNS3080_SROM_ENABLE           0x14
#define ADNS3080_FRAME_PERIOD_MAX_BOUND_LOWER      0x19
#define ADNS3080_FRAME_PERIOD_MAX_BOUND_UPPER      0x1a
#define ADNS3080_FRAME_PERIOD_MIN_BOUND_LOWER      0x1b
#define ADNS3080_FRAME_PERIOD_MIN_BOUND_UPPER      0x1c
#define ADNS3080_SHUTTER_MAX_BOUND_LOWER           0x1e
#define ADNS3080_SHUTTER_MAX_BOUND_UPPER           0x1e
#define ADNS3080_SROM_ID               0x1f
#define ADNS3080_OBSERVATION           0x3d
#define ADNS3080_INVERSE_PRODUCT_ID    0x3f
#define ADNS3080_PIXEL_BURST           0x40
#define ADNS3080_MOTION_BURST          0x50
#define ADNS3080_SROM_LOAD             0x60

#define ADNS3080_PRODUCT_ID_VAL        0x17
#define ADNS3080_EXTENDED_CONFIG       0x0b

unsigned long lastRead = 0;
unsigned long lastprint = 0;

class Position 
{

private:
    Adafruit_MPU6050 mpu;
    Rover *rover;
    volatile byte movementflag=0;
    volatile int xydat[2];
    float dTheta;
    float distance_x;
    float distance_y;
    bool callibrate = false;
    float gyroOffset;
    float xsum = 0;
    int i = 0;
    unsigned long lastRead = 1;

    struct MD
    {
        byte motion;
        char dx, dy;
        byte squal;
        word shutter;
        byte max_pix;
    };
    byte frame[ADNS3080_PIXELS_X * ADNS3080_PIXELS_Y];
    int convTwosComp(int b)
    {
        if(b & 0x80){
            b = -1 * ((b ^ 0xff) + 1);
            }
        return -b;
    }
    void mousecam_reset()
    {
        digitalWrite(PIN_MOUSECAM_RESET,HIGH);
        delay(1); // reset pulse >10us
        digitalWrite(PIN_MOUSECAM_RESET,LOW);
        delay(35); // 35ms from reset to functional
    }
    int mousecam_read_reg(int reg)
    {
        digitalWrite(PIN_MOUSECAM_CS, LOW);
        SPI.transfer(reg);
        delayMicroseconds(75);
        int ret = SPI.transfer(0xff);
        digitalWrite(PIN_MOUSECAM_CS,HIGH);
        delayMicroseconds(1);
        return ret;
    }
    int mousecam_init()
    {
        pinMode(PIN_MOUSECAM_RESET,OUTPUT);
        pinMode(PIN_MOUSECAM_CS,OUTPUT);

        digitalWrite(PIN_MOUSECAM_CS,HIGH);

        mousecam_reset();
        return 1;
    }
    void mousecam_read_motion(struct MD *p)
    {
        digitalWrite(PIN_MOUSECAM_CS, LOW);
        SPI.transfer(ADNS3080_MOTION_BURST);
        delayMicroseconds(75);
        p->motion =  SPI.transfer(0xff);
        p->dx =  SPI.transfer(0xff);
        p->dy =  SPI.transfer(0xff);
        p->squal =  SPI.transfer(0xff);
        p->shutter =  SPI.transfer(0xff)<<8;
        p->shutter |=  SPI.transfer(0xff);
        p->max_pix =  SPI.transfer(0xff);
        digitalWrite(PIN_MOUSECAM_CS,HIGH);
        delayMicroseconds(5);
    }
    char asciiart(int k)
    {
        static char foo[] = "WX86*3I>!;~:,`. ";
        return foo[k>>4];
    }
    int mousecam_frame_capture(byte *pdata)
    {
        mousecam_write_reg(ADNS3080_FRAME_CAPTURE,0x83);

        digitalWrite(PIN_MOUSECAM_CS, LOW);

        SPI.transfer(ADNS3080_PIXEL_BURST);
        delayMicroseconds(50);

        int pix;
        byte started = 0;
        int count;
        int timeout = 0;
        int ret = 0;
        for(count = 0; count < ADNS3080_PIXELS_X * ADNS3080_PIXELS_Y; )
        {
            pix = SPI.transfer(0xff);
            delayMicroseconds(10);
            if(started==0)
            {
            if(pix&0x40)
                started = 1;
            else
            {
                timeout++;
                if(timeout==100)
                {
                ret = -1;
                break;
                }
            }
            }
            if(started==1)
            {
            pdata[count++] = (pix & 0x3f)<<2; // scale to normal grayscale byte range
            }
        }

        digitalWrite(PIN_MOUSECAM_CS,HIGH);
        delayMicroseconds(14);

        return ret;
    }
    float deltaTheta(float x)
    {
        return x *  0.00544588965;
    }
    void mousecam_write_reg(int reg, int val)
    {
    digitalWrite(PIN_MOUSECAM_CS, LOW);
    SPI.transfer(reg | 0x80);
    SPI.transfer(val);
    digitalWrite(PIN_MOUSECAM_CS,HIGH);
    delayMicroseconds(50);
    }
    int read_Sensor(int reg)
    {
        digitalWrite(PIN_MOUSECAM_CS, LOW);
        SPI.transfer(reg);
        delayMicroseconds(75);
        int ret = SPI.transfer(0xff);
        digitalWrite(PIN_MOUSECAM_CS,HIGH);
        delayMicroseconds(1);
        return ret;
    }
public:
    Position(Rover *ROVER)
    {
        rover = ROVER;
    }
    void setupPostion()
    {
        pinMode(PIN_SS,OUTPUT);
        pinMode(PIN_MISO,INPUT);
        pinMode(PIN_MOSI,OUTPUT);
        pinMode(PIN_SCK,OUTPUT);
        pinMode(PIN_LED1,OUTPUT);
        SPI.begin();
        SPI.setClockDivider(SPI_CLOCK_DIV32);
        SPI.setDataMode(SPI_MODE3);
        SPI.setBitOrder(MSBFIRST);
        if(mousecam_init()==-1)
        {
            Serial.println("Mouse cam failed to init");
            while(1);
        }
        digitalWrite(PIN_LED1,HIGH);
        //digitalWrite(PIN_LED2,HIGH);
        digitalWrite(PIN_SS,HIGH);
        mpu.begin();
        mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
        mpu.setFilterBandwidth(MPU6050_BAND_260_HZ);
        mpu.setGyroRange(MPU6050_RANGE_250_DEG);
        
    }
    void updatePosition()
    {
        int val = mousecam_read_reg(ADNS3080_PIXEL_SUM);
        MD md;
        sensors_event_t a, g, t;
        mpu.getEvent(&a,&g,&t);
        if(callibrate)
        {
            i++;
            Serial.println("Avarage x error: " + String(xsum / (float)i, 5));
        }
        mousecam_read_motion(&md);
        distance_x = ((float)convTwosComp(md.dx) *1/(1407.38/300));
        distance_y = ((float)convTwosComp(md.dy) * 1/(1407.38/300));
        dTheta = deltaTheta(distance_x);
        rover->velocity = -distance_y / ((float)(millis()-lastRead) / 1000.0F);
        rover->xpos -= distance_y * cos(rover->angleFacing);
        rover->ypos -= distance_y * sin(rover->angleFacing);
        rover->angularVelocity = -g.gyro.z +gyroOffset;
        rover->angleFacing += rover->angularVelocity * ((float)(millis()-lastRead) / 1000.0F);
        //Serial.println("QUality" + String(md.squal / 4));
        if(rover->angleFacing < -3.14F)
            rover->angleFacing += 6.28F;
        else if(rover->angleFacing > 3.14F)
            rover->angleFacing -= 6.28F;
        lastRead = millis();

        
        
  /*if(millis() - lastprint >= 200){
     Serial.println("Quality: " + String( md.squal / 4));
    lastprint = millis();
    }   */
}
        
    
    void Callibrate(int times)
    {
        float gyroZ = 0;
        for(int i = 0; i < times; i++)
        {
            Serial.println("Callibrating");
            sensors_event_t a, g, t;
            mpu.getEvent(&a,&g,&t);
            gyroZ += g.gyro.z;
            delay(1);
        }
        gyroOffset = gyroZ / times;
        Serial.println("We found the gyroscope offset to be: " + String(gyroOffset));
    }
    
    
};





#endif