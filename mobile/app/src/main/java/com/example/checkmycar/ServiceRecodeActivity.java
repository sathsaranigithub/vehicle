package com.example.checkmycar;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;

import java.util.ArrayList;
import java.util.Map;

public class ServiceRecodeActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private ServiceRecordAdapter adapter;
    private ArrayList<Map<String, Object>> maintenanceRecords = new ArrayList<>();
    private FirebaseFirestore db;
    private TextView registrationNumberTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.service_recode);

        recyclerView = findViewById(R.id.recyclerView);
        registrationNumberTextView = findViewById(R.id.registrationNumTextView);
        db = FirebaseFirestore.getInstance();

        // Set up RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        // Retrieve the registration number from the Intent
        String registrationNumber = getIntent().getStringExtra("REGISTRATION_NUMBER");

        if (registrationNumber != null) {
            registrationNumberTextView.setText(registrationNumber);
            fetchMaintenanceRecords(registrationNumber);
        } else {
            registrationNumberTextView.setText("Not available");
        }
    }

    private void fetchMaintenanceRecords(String registrationNumber) {
        db.collection("service_maintenance_history")
                .document(registrationNumber)
                .get()
                .addOnSuccessListener(documentSnapshot -> {
                    if (documentSnapshot.exists()) {
                        ArrayList<Map<String, Object>> maintenanceRecords = (ArrayList<Map<String, Object>>) documentSnapshot.get("maintenanceRecords");
                        if (maintenanceRecords != null && !maintenanceRecords.isEmpty()) {
                            // Filter the records to show only upcoming ones
                            ArrayList<Map<String, Object>> upcomingRecords = new ArrayList<>();
                            for (Map<String, Object> record : maintenanceRecords) {
                                String date = (String) record.get("date");
                                if (isUpcoming(date)) {
                                    upcomingRecords.add(record);
                                }
                            }
                            // Set up the adapter
                            adapter = new ServiceRecordAdapter(upcomingRecords);
                            recyclerView.setAdapter(adapter);
                        } else {
                            Toast.makeText(ServiceRecodeActivity.this, "No records found.", Toast.LENGTH_SHORT).show();
                        }
                    }
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(ServiceRecodeActivity.this, "Error fetching records: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
    }

    // Helper method to check if the date is in the future
    private boolean isUpcoming(String date) {
        // Implement date comparison logic here
        // For simplicity, let's assume you have a way to check if the date is in the future
        return true; // Replace this with actual logic
    }
}
