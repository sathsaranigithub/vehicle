package com.example.checkmycar;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

public class AddUpcomingMaintenanceActivity extends AppCompatActivity {

    private TextView registrationNumberTextView;
    private Button save;
    private EditText dateInput, serviceTypeInput, costEstimationInput, serviceLocationInput, serviceDescriptionInput;

    private int selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute;
    ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.add_upcoming_maintenance);

        // Initialize views
        registrationNumberTextView = findViewById(R.id.registrationNumTextView);
        save = findViewById(R.id.save);
        dateInput = findViewById(R.id.date_input);
        serviceTypeInput = findViewById(R.id.service_type_input);
        costEstimationInput = findViewById(R.id.cost_estimation_input);
        serviceLocationInput = findViewById(R.id.service_location_input);
        serviceDescriptionInput = findViewById(R.id.service_description_input);
        progressBar = findViewById(R.id.progressBar); // Initialize progress bar

        // Retrieve the registration number passed from the previous activity
        String registrationNumber = getIntent().getStringExtra("REGISTRATION_NUMBER");

        if (registrationNumber != null) {
            // Display the registration number in the TextView
            registrationNumberTextView.setText(registrationNumber);
        } else {
            // Handle case where registration number is not passed
            registrationNumberTextView.setText("Not available");
        }

        // Set OnClickListener for Save button
        save.setOnClickListener(v -> saveUpcomingMaintenance(registrationNumber));

        // Set OnClickListener for Date input field to show the date picker
        dateInput.setOnClickListener(v -> showDatePicker());
    }

    // Method to show the DatePickerDialog
    private void showDatePicker() {
        Calendar calendar = Calendar.getInstance();

        DatePickerDialog datePickerDialog = new DatePickerDialog(
                AddUpcomingMaintenanceActivity.this,
                (view, year, month, dayOfMonth) -> {
                    // Set the selected date to the dateInput EditText
                    selectedYear = year;
                    selectedMonth = month;
                    selectedDay = dayOfMonth;
                    dateInput.setText(dayOfMonth + "/" + (month + 1) + "/" + year);
                    // After date is selected, show time picker
                    showTimePicker();
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
        );
        datePickerDialog.show();
    }

    // Method to show the TimePickerDialog
    private void showTimePicker() {
        Calendar calendar = Calendar.getInstance();

        TimePickerDialog timePickerDialog = new TimePickerDialog(
                AddUpcomingMaintenanceActivity.this,
                (view, hourOfDay, minute) -> {
                    // Set the selected time to the timeInput EditText
                    selectedHour = hourOfDay;
                    selectedMinute = minute;
                    // Append time to the date
                    String time = String.format("%02d:%02d", selectedHour, selectedMinute);
                    dateInput.setText(dateInput.getText().toString() + " " + time);
                },
                calendar.get(Calendar.HOUR_OF_DAY),
                calendar.get(Calendar.MINUTE),
                true
        );
        timePickerDialog.show();
    }

    // Method to save the upcoming maintenance details to Firestore
    private void saveUpcomingMaintenance(String registrationNumber) {
        // Show progress bar while saving data
        progressBar.setVisibility(ProgressBar.VISIBLE);

        // Get data from input fields
        String date = dateInput.getText().toString().trim();
        String serviceType = serviceTypeInput.getText().toString().trim();
        String costEstimation = costEstimationInput.getText().toString().trim();
        String serviceLocation = serviceLocationInput.getText().toString().trim();
        String serviceDescription = serviceDescriptionInput.getText().toString().trim();

        // Validate input
        if (date.isEmpty() || serviceType.isEmpty() || costEstimation.isEmpty() || serviceLocation.isEmpty() || serviceDescription.isEmpty()) {
            // Display error message
            Snackbar.make(findViewById(android.R.id.content), "All fields must be filled out.", Snackbar.LENGTH_SHORT).show();
            progressBar.setVisibility(ProgressBar.GONE); // Hide progress bar after error
            return;
        }

        // Prepare data to save in Firestore
        Map<String, Object> maintenanceDetails = new HashMap<>();
        maintenanceDetails.put("date", date);
        maintenanceDetails.put("serviceType", serviceType);
        maintenanceDetails.put("costEstimation", costEstimation);
        maintenanceDetails.put("serviceLocation", serviceLocation);
        maintenanceDetails.put("serviceDescription", serviceDescription);

        // Reference to Firestore
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        DocumentReference docRef = db.collection("up_maintenance").document(registrationNumber);

        // Fetch existing maintenance records to preserve them and add new one
        docRef.get().addOnSuccessListener(documentSnapshot -> {
            ArrayList<Map<String, Object>> maintenanceRecords;

            if (documentSnapshot.exists()) {
                // If the document already exists, get the current maintenance records
                maintenanceRecords = (ArrayList<Map<String, Object>>) documentSnapshot.get("maintenanceRecords");
            } else {
                // If no existing records, initialize a new list
                maintenanceRecords = new ArrayList<>();
            }

            // Add the new maintenance record to the list
            maintenanceRecords.add(maintenanceDetails);

            // Update the document with the new list of maintenance records
            docRef.set(new HashMap<String, Object>() {{
                        put("maintenanceRecords", maintenanceRecords);
                    }})
                    .addOnSuccessListener(aVoid -> {
                        Snackbar.make(findViewById(android.R.id.content), "Upcoming maintenance saved successfully.", Snackbar.LENGTH_SHORT).show();
                        progressBar.setVisibility(ProgressBar.GONE); // Hide progress bar after success
                    })
                    .addOnFailureListener(e -> {
                        Snackbar.make(findViewById(android.R.id.content), "Error saving maintenance details: " + e.getMessage(), Snackbar.LENGTH_LONG).show();
                        Log.e("SaveError", "Error saving maintenance details: " + e.getMessage());
                        progressBar.setVisibility(ProgressBar.GONE); // Hide progress bar after failure
                    });
        }).addOnFailureListener(e -> {
            Snackbar.make(findViewById(android.R.id.content), "Error fetching data: " + e.getMessage(), Snackbar.LENGTH_LONG).show();
            Log.e("FetchError", "Error fetching data: " + e.getMessage());
            progressBar.setVisibility(ProgressBar.GONE); // Hide progress bar after failure
        });
    }
}
