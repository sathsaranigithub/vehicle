package com.example.checkmycar;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;

public class OwnerMaintenanceActivity extends AppCompatActivity {

    private TextView registrationNumberTextView, upcoming;
    private Button addupcoming,serviceshow,serviceadd;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.owner_maintenance);

        // Initialize views
        registrationNumberTextView = findViewById(R.id.registrationNumTextView);
        upcoming = findViewById(R.id.upcomin_recode);
        addupcoming = findViewById(R.id.addup);
        serviceshow = findViewById(R.id.service_show);
        serviceadd = findViewById(R.id.service_add);
        db = FirebaseFirestore.getInstance();

        // Retrieve the registration number from the Intent
        String registrationNumber = getIntent().getStringExtra("REGISTRATION_NUMBER");

        if (registrationNumber != null) {
            // Display the registration number in the TextView
            registrationNumberTextView.setText(registrationNumber);
        } else {
            // Handle case where registration number is not passed
            registrationNumberTextView.setText("Not available");
        }

        // Handle Add Upcoming Maintenance button click
        addupcoming.setOnClickListener(v -> {
            if (registrationNumber != null) {
                // Start UpComingMaintenanceActivity and pass the registration number
                Intent intent = new Intent(OwnerMaintenanceActivity.this, AddUpcomingMaintenanceActivity.class);
                intent.putExtra("REGISTRATION_NUMBER", registrationNumber); // Pass registration number
                startActivity(intent); // Start the activity
            }
        });
        serviceadd.setOnClickListener(v -> {
            if (registrationNumber != null) {
                // Start UpComingMaintenanceActivity and pass the registration number
                Intent intent = new Intent(OwnerMaintenanceActivity.this, AddMaintenanceHistoryRecodeActivity.class);
                intent.putExtra("REGISTRATION_NUMBER", registrationNumber); // Pass registration number
                startActivity(intent); // Start the activity
            }
        });
        serviceshow.setOnClickListener(v -> {
            if (registrationNumber != null) {
                // Start UpComingMaintenanceActivity and pass the registration number
                Intent intent = new Intent(OwnerMaintenanceActivity.this, ServiceRecodeActivity.class);
                intent.putExtra("REGISTRATION_NUMBER", registrationNumber); // Pass registration number
                startActivity(intent); // Start the activity
            }
        });


        // Fetch upcoming maintenance records
        if (registrationNumber != null) {
            fetchUpcomingMaintenanceRecords(registrationNumber);
        }
    }

    private void fetchUpcomingMaintenanceRecords(String registrationNumber) {
        // Get the current date
        Calendar calendar = Calendar.getInstance();
        Date currentDate = calendar.getTime();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");

        // Fetch records from Firestore
        db.collection("up_maintenance")
                .document(registrationNumber)
                .get()
                .addOnSuccessListener(documentSnapshot -> {
                    if (documentSnapshot.exists()) {
                        // Get the maintenance records array from the document
                        ArrayList<Map<String, Object>> maintenanceRecords = (ArrayList<Map<String, Object>>) documentSnapshot.get("maintenanceRecords");

                        if (maintenanceRecords != null && !maintenanceRecords.isEmpty()) {
                            StringBuilder upcomingText = new StringBuilder();

                            for (Map<String, Object> record : maintenanceRecords) {
                                String maintenanceDate = (String) record.get("date");

                                try {
                                    Date maintenanceDateParsed = sdf.parse(maintenanceDate);
                                    if (maintenanceDateParsed != null && maintenanceDateParsed.after(currentDate)) {
                                        // Append upcoming record to the StringBuilder
                                        String recordText = "Date: " + maintenanceDate + "\n" +
                                                "Service Type: " + record.get("serviceType") + "\n" +
                                                "Cost Estimation: " + record.get("costEstimation") + "\n" +
                                                "Location: " + record.get("serviceLocation") + "\n" +
                                                "Description: " + record.get("serviceDescription") + "\n\n";
                                        upcomingText.append(recordText);
                                    }
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }

                            if (upcomingText.length() > 0) {
                                // Set all the upcoming records to the TextView
                                upcoming.setText(upcomingText.toString());
                            } else {
                                // No upcoming records found
                                Toast.makeText(this, "No upcoming maintenance records found.", Toast.LENGTH_SHORT).show();
                                upcoming.setText("Add your upcoming maintenance records.");
                            }
                        } else {
                            Toast.makeText(this, "No upcoming maintenance records found.", Toast.LENGTH_SHORT).show();
                            upcoming.setText("Add your upcoming maintenance records.");
                        }
                    } else {
                        Toast.makeText(this, "No records found for this registration number.", Toast.LENGTH_SHORT).show();
                    }
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(this, "Error fetching maintenance records: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
    }

}
