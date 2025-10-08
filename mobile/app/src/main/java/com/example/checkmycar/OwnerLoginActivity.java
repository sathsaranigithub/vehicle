package com.example.checkmycar;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;

import androidx.appcompat.app.AppCompatActivity;

public class OwnerLoginActivity extends AppCompatActivity {
    TextInputEditText editTextEmail, editTextPassword, editTextRegisterNum;
    ProgressBar progressBar;
    Button loginButton;
    FirebaseFirestore db;

    // SharedPreferences key for tracking login status
    private static final String PREFS_NAME = "UserPrefs";
    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";
    private static final String KEY_EMAIL = "email";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.owner_login);

        // Check if user is already logged in
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        boolean isLoggedIn = prefs.getBoolean(KEY_IS_LOGGED_IN, false);
        if (isLoggedIn) {
            // If already logged in, navigate to OwnerHomeActivity
            Intent intent = new Intent(OwnerLoginActivity.this, OwnerHomeActivity.class);
            startActivity(intent);
            finish();
            return;  // No need to show the login screen if the user is already logged in
        }

        // Initialize views
        editTextRegisterNum = findViewById(R.id.registernum);
        editTextEmail = findViewById(R.id.email);
        editTextPassword = findViewById(R.id.password);
        progressBar = findViewById(R.id.progressBar);
        loginButton = findViewById(R.id.Login);

        // Initialize Firebase Firestore
        db = FirebaseFirestore.getInstance();

        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String email = editTextEmail.getText().toString().trim();
                String password = editTextPassword.getText().toString().trim();
                String registerNum = editTextRegisterNum.getText().toString().trim();

                // Basic validation
                if (email.isEmpty() || password.isEmpty() || registerNum.isEmpty()) {
                    Snackbar.make(v, "Please fill all fields", Snackbar.LENGTH_SHORT).show();
                    return;
                }

                // Show progress bar while checking the credentials
                progressBar.setVisibility(View.VISIBLE);

                // Fetch data from Firestore based on the register number
                DocumentReference docRef = db.collection("Registration_users").document(registerNum);
                docRef.get().addOnCompleteListener(task -> {
                    progressBar.setVisibility(View.GONE); // Hide progress bar once complete
                    if (task.isSuccessful()) {
                        // Get the document snapshot
                        DocumentSnapshot documentSnapshot = task.getResult();
                        if (documentSnapshot.exists()) {
                            // Retrieve stored email and password
                            String storedEmail = documentSnapshot.getString("email");
                            String storedPassword = documentSnapshot.getString("password");

                            // Compare email and password with user input
                            if (email.equals(storedEmail) && password.equals(storedPassword)) {
                                // Authentication successful, navigate to OwnerHomeActivity

                                // Save login status in SharedPreferences
                                // Inside the successful login condition:
                                SharedPreferences.Editor editor = prefs.edit();
                                editor.putBoolean(KEY_IS_LOGGED_IN, true);
                                editor.putString(KEY_EMAIL, email); // Save email
                                editor.putString("REGISTER_NUMBER", registerNum); // Save registration number
                                editor.apply();


                                // Pass registration number to the next activity (OwnerHomeActivity)
                                Intent intent = new Intent(OwnerLoginActivity.this, OwnerHomeActivity.class);
                                intent.putExtra("REGISTRATION_NUMBER", registerNum); // Pass registration number
                                startActivity(intent);
                                finish(); // Close this activity
                            } else {
                                // Incorrect credentials, show snackbar
                                Snackbar.make(v, "Authentication failed. Check your email, password, or register number", Snackbar.LENGTH_LONG).show();
                            }
                        } else {
                            // If no such register number exists in the Firestore
                            Snackbar.make(v, "No such register number found", Snackbar.LENGTH_LONG).show();
                        }
                    } else {
                        // Firestore fetch failed
                        Snackbar.make(v, "Error fetching data", Snackbar.LENGTH_LONG).show();
                    }
                });
            }
        });
    }
}
