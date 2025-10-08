package com.example.checkmycar;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentReference;

import java.util.HashMap;
import java.util.Map;

public class RegisterActivity extends AppCompatActivity {

    private TextView textView3, textView4;
    private EditText uname, station1, pid1,email, password;
    private Button requestPermission;
    private ProgressBar progressBar;

    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.register);

        // Initialize views
        textView3 = findViewById(R.id.textView3);
        textView4 = findViewById(R.id.textView4);
        uname = findViewById(R.id.uname);
        station1 = findViewById(R.id.station1);
        pid1 = findViewById(R.id.pid1);
        email = findViewById(R.id.email);
        password = findViewById(R.id.password);
        requestPermission = findViewById(R.id.request_permission);
        progressBar = findViewById(R.id.progressBar);

        // Initialize Firestore instance
        db = FirebaseFirestore.getInstance();

        // Handle the Request Permission button click
        requestPermission.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveDataToFirestore();
            }
        });
    }

    private void saveDataToFirestore() {
        // Show progress bar while saving data
        progressBar.setVisibility(View.VISIBLE);

        // Get the input data
        String name = uname.getText().toString().trim();
        String station = station1.getText().toString().trim();
        String pid = pid1.getText().toString().trim();
        String emailAddress = email.getText().toString().trim();
        String userPassword = password.getText().toString().trim();

        // Validate inputs
        if (name.isEmpty() || station.isEmpty() || pid.isEmpty() || emailAddress.isEmpty() || userPassword.isEmpty()) {
            Snackbar.make(findViewById(android.R.id.content), "All fields must be filled out.", Snackbar.LENGTH_SHORT).show();
            progressBar.setVisibility(View.GONE);
            return;
        }

        // Create a Map to hold the data
        Map<String, Object> userData = new HashMap<>();
        userData.put("name", name);
        userData.put("station", station);
        userData.put("pid", pid);
        userData.put("email", emailAddress);
        userData.put("password", userPassword);  // You may want to hash this for security reasons

        // Create a reference to the "police" collection and the document with the email as the ID
        DocumentReference docRef = db.collection("police").document(emailAddress);

        // Save data to Firestore
        docRef.set(userData)
                .addOnSuccessListener(aVoid -> {
                    showDialog("Success", "Your request has been sent successfully. Please wait for the administration approval. Once approved, you will receive an email.");
                    progressBar.setVisibility(View.GONE);
                    // Optionally, you can start another activity here if needed
                })
                .addOnFailureListener(e -> {
                    Snackbar.make(findViewById(android.R.id.content), "Error saving data: " + e.getMessage(), Snackbar.LENGTH_LONG).show();
                    progressBar.setVisibility(View.GONE);
                });
    }
    private void showDialog(String title, String message) {
        // Create an AlertDialog to show the result to the user
        new AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)
                .setCancelable(false)
                .setPositiveButton("OK", (dialog, id) -> dialog.dismiss())
                .show();
    }
}
