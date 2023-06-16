#ifndef radar_h
#define radar_h

#define radarSquare      31
#define radarWave        32


#include <Arduino.h>
#include <vector>

class Radar
{
private:
int pulseHigh; // Integer variable to capture High time of the incoming pulse

int pulseLow; // Integer variable to capture Low time of the incoming pulse

float pulseTotal; // Float variable to capture Total time of the incoming pulse

float frequency = 0; // Calculated Frequency

float spd; //average speed
float lb; //upper speed bound
float ub; //lower speed bound
bool fanDetect; //fan in fov
int percentage; //percentage of previous pulses high
//int pulseArray[50];
std::vector<int> pulseArray;
//int amplitudeArray[50];
std::vector<int> amplitudeArray;
int size = 50;
int previousTime = 0;
bool previousVal =  LOW;
bool currentVal;
int currentTime = 0;
int period;
int maxAmplitude = 0;
int currentAmplitude;
int averagedAmplitude;

double sum=0;
int count=0;


public:
void setup() {
  pinMode(radarSquare,INPUT);
  pinMode(radarWave, INPUT);

  
  lb = 140;
  ub = 350;

  for(int i = 0; i <size; i++)
  {
    pulseArray.push_back(0);
    amplitudeArray.push_back(0);
  }
  Serial.println("Setup is done!");
  
}
void loop() {

  
  currentVal = digitalRead(radarSquare);
  if(currentVal == LOW && previousVal == HIGH)
  {
    currentTime = micros();
    period = currentTime - previousTime;
    previousTime = currentTime;
    if(period!= 0)
    {
      frequency = 1000000 / period; // Frequency in Hertz (Hz)
    }
    
    //Serial.println(frequency);
    spd = frequency*300000000/2/10500000000;

    percentage = 0;

    pulseArray.erase(pulseArray.begin());
    amplitudeArray.erase(pulseArray.begin());
    for(int i = 0; i < size-1; i++)
    {
      averagedAmplitude += amplitudeArray[i];
      if(lb<pulseArray[i] && pulseArray[i]<ub)
      {
        percentage++;
      }
    }
    pulseArray.push_back(frequency);
    amplitudeArray.push_back(maxAmplitude);
    averagedAmplitude = averagedAmplitude/size;
    fanDetect = (percentage > size/4);
    //fanDetect = (lb<spd && spd<ub);

    maxAmplitude = 0;
   // Serial.println("Loop");
  }else if(micros()-previousTime > 700000)
  {
    pulseArray.erase(pulseArray.begin());
    pulseArray.push_back(0);
    previousTime = micros();
  }
  previousVal = currentVal;

  currentAmplitude = analogRead(radarWave)*2-1500;
  if(analogRead(radarWave) > maxAmplitude)
  {
    maxAmplitude = currentAmplitude;
  }
  
}
float getAvarageAmplitude(){return averagedAmplitude;}
bool getFanDetect(){return fanDetect;}



};



#endif