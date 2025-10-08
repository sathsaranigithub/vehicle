package com.example.checkmycar;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class QrDetailsActivity extends AppCompatActivity {

    private TextView Text1, Text2, Text3, Text4;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.qr_details);

        // Initialize TextViews
        Text1 = findViewById(R.id.Text1); // Vehicle details
        Text2 = findViewById(R.id.Text2); // Owner details
        Text3 = findViewById(R.id.Text3); // Insurance details
        Text4 = findViewById(R.id.Text4); // Registration details

        // Retrieve the scanned QR data from Intent
        String scannedData = getIntent().getStringExtra("QR_DATA");

        if (scannedData != null) {
            // Parse the scanned JSON data using Gson
            Gson gson = new Gson();
            JsonObject qrDetails = gson.fromJson(scannedData, JsonObject.class);

            // Extract vehicle details
            String vehicleDetails = "Vehicle Make: " + qrDetails.get("vehicleMake").getAsString() + "\n" +
                    "Vehicle Model: " + qrDetails.get("vehicleModel").getAsString() + "\n" +
                    "Vehicle Year: " + qrDetails.get("vehicleYear").getAsInt() + "\n" +
                    "Vehicle Color: " + qrDetails.get("vehicleColor").getAsString() + "\n" +
                    "License Plate Number: " + qrDetails.get("licensePlateNumber").getAsString() + "\n" +
                    "VIN: " + qrDetails.get("vin").getAsString() + "\n" +
                    "Engine Number: " + qrDetails.get("engineNumber").getAsString();

            // Set vehicle details to TextView 1
            Text1.setText(vehicleDetails);

            // Extract owner details and label them as First, Second, Third Owner
            StringBuilder ownerDetails = new StringBuilder();
            for (int i = 0; i < qrDetails.getAsJsonArray("owners").size(); i++) {
                JsonObject owner = qrDetails.getAsJsonArray("owners").get(i).getAsJsonObject();
                String ownerLabel = "";

                // Label owners as "First Owner", "Second Owner", etc.
                if (i == 0) {
                    ownerLabel = "First Owner:";
                } else if (i == 1) {
                    ownerLabel = "Second Owner:";
                } else if (i == 2) {
                    ownerLabel = "Third Owner:";
                } else {
                    ownerLabel = "Other Owner " + (i + 1) + ":";
                }

                // Append the owner details with their label
                ownerDetails.append(ownerLabel).append("\n")
                        .append("Owner Name: ").append(owner.get("ownerName").getAsString()).append("\n")
                        .append("Owner Address: ").append(owner.get("ownerAddress").getAsString()).append("\n")
                        .append("Owner Email: ").append(owner.get("ownerEmail").getAsString()).append("\n")
                        .append("Owner Phone: ").append(owner.get("ownerPhoneNumber").getAsString()).append("\n\n");
            }

            // Set owner details to TextView 2
            Text2.setText(ownerDetails.toString());

            // Extract insurance details
            String insuranceDetails = "Insurance Provider: " + qrDetails.get("insuranceProviderName").getAsString() + "\n" +
                    "Insurance Expiry Date: " + qrDetails.get("insuranceExpiryDate").getAsString();

            // Set insurance details to TextView 3
            Text3.setText(insuranceDetails);

            // Extract registration details
            String registrationDetails = "Registration Number: " + qrDetails.get("registrationNumber").getAsString() + "\n" +
                    "Registration Date: " + qrDetails.get("registrationDate").getAsString() + "\n" +
                    "Registration Expiry Date: " + qrDetails.get("registrationExpiryDate").getAsString();

            // Set registration details to TextView 4
            Text4.setText(registrationDetails);
        }
    }
}
