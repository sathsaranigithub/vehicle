package com.example.checkmycar;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class BuyerQrDetailsActivity extends AppCompatActivity {

    private TextView Text1, Text2, Text3, Text4;
    Button more;
    ImageView image;
    FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.buyer_qr_details);

        // Initialize TextViews
        Text1 = findViewById(R.id.Text1); // Vehicle details
        Text2 = findViewById(R.id.Text2); // Owner details
        Text3 = findViewById(R.id.Text3); // Insurance details
        Text4 = findViewById(R.id.Text4); // Registration details
        more = findViewById(R.id.abc);
        image = findViewById(R.id.image);
        db = FirebaseFirestore.getInstance();


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
            // Extract registration number to pass to ServiceRecodeActivity
            String registrationNumber = qrDetails.get("registrationNumber").getAsString();

            // Fetch the image from Firestore
            fetchImageFromFirestore(registrationNumber);
            // Handle More button click to pass registration number to ServiceRecodeActivity
            more.setOnClickListener(v -> {
                if (!registrationNumber.isEmpty()) {
                    // Pass the registration number to the next activity
                    Intent intent = new Intent(BuyerQrDetailsActivity.this, ServiceRecodeActivity.class);
                    intent.putExtra("REGISTRATION_NUMBER", registrationNumber); // Pass registration number
                    startActivity(intent); // Navigate to ServiceRecodeActivity
                } else {
                    Snackbar.make(v, "Registration Number is not available", Snackbar.LENGTH_SHORT).show();
                }
            });
        }
    }
    private void fetchImageFromFirestore(String registrationNumber) {
        DocumentReference docRef = db.collection("vehicle_image").document(registrationNumber);
        docRef.get().addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                if (task.getResult().exists()) {
                    String imageUrl = task.getResult().getString("imageUrl");

                    // If image URL exists, load the image into the ImageView
                    if (imageUrl != null && !imageUrl.isEmpty()) {
                        // Use a library like Glide or Picasso to load the image
                        Glide.with(this)
                                .load(imageUrl)
                                .into(image);
                    }
                }
            } else {
                Snackbar.make(findViewById(android.R.id.content), "Error fetching image", Snackbar.LENGTH_SHORT).show();
            }
        });
    }
}
