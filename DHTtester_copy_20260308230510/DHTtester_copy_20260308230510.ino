#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>

// ----------- Pin Definitions -----------
#define DHTPIN D4
#define DHTTYPE DHT11
#define IR_PIN A0

DHT dht(DHTPIN, DHTTYPE);

// ----------- WiFi Credentials -----------
const char* ssid = "AdhiNest_PG";
const char* password = "99785548";

// ----------- Server IP (Your PC IP) -----------
const char* serverName = "http://192.168.29.203:5000/api/sensor";
// Replace 192.168.1.8 with your IP from ipconfig

// -------------------------------------------

void setup() {
  Serial.begin(9600);
  dht.begin();

  WiFi.begin(ssid, password);

  Serial.println("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting...");
  }

  Serial.println("Connected to WiFi!");
}

void loop() {

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int irValue = analogRead(IR_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read DHT sensor!");
    delay(2000);
    return;
  }

  Serial.println("------------");

  Serial.print("Temperature: ");
  Serial.println(temperature);

  Serial.print("Humidity: ");
  Serial.println(humidity);

  Serial.print("IR Radiation Value: ");
  Serial.println(irValue);

  if (WiFi.status() == WL_CONNECTED) {

    WiFiClient client;
    HTTPClient http;

    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"temperature\":" + String(temperature) + ",";
    jsonData += "\"humidity\":" + String(humidity) + ",";
    jsonData += "\"ir_radiation\":" + String(irValue);
    jsonData += "}";

    int httpResponseCode = http.POST(jsonData);

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();
  }

  delay(5000);
}
