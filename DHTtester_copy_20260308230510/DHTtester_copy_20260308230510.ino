#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>

#define DHTPIN D4
#define DHTTYPE DHT11
#define IR_PIN A0

DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP280 bmp;

const char* ssid = "AdhiNest_PG";
const char* password = "99785548";

const char* serverName = "http://192.168.29.203:5000/api/sensor";

void setup() {

  Serial.begin(9600);
  delay(1000);

  Serial.println("Starting ESP8266");

  Wire.begin(D2, D1);

  dht.begin();

  if (!bmp.begin(0x77)) {
    Serial.println("BMP280 not detected!");
    while (1);
  }

  Serial.println("BMP280 OK");

  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.println(WiFi.localIP());
}

void loop() {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Lost");
    delay(2000);
    return;
  }

  float temperature = bmp.readTemperature();
  float pressure = bmp.readPressure() / 100.0;
  float humidity = dht.readHumidity();
  int irValue = analogRead(IR_PIN);

  if (isnan(humidity)) {
    Serial.println("DHT read error");
    delay(2000);
    return;
  }

  Serial.println("------Sensor Data------");

  Serial.print("Temp: ");
  Serial.println(temperature);

  Serial.print("Humidity: ");
  Serial.println(humidity);

  Serial.print("Pressure: ");
  Serial.println(pressure);

  Serial.print("IR: ");
  Serial.println(irValue);

  WiFiClient client;
  HTTPClient http;

  http.begin(client, serverName);
  http.addHeader("Content-Type", "application/json");

  String json = "{";
  json += "\"temperature\":" + String(temperature) + ",";
  json += "\"humidity\":" + String(humidity) + ",";
  json += "\"pressure\":" + String(pressure) + ",";
  json += "\"ir_radiation\":" + String(irValue);
  json += "}";

  int httpCode = http.POST(json);

  Serial.print("HTTP Response: ");
  Serial.println(httpCode);

  http.end();

  delay(5000);
}