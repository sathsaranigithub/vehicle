package com.example.checkmycar;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.DocumentSnapshot;

public class PoliceLoginActivity extends AppCompatActivity {

    TextInputEditText email, password;
    Button loginButton;
    FirebaseFirestore db;
    FirebaseAuth auth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.police_login);

        // Initialize views and Firebase instances
        email = findViewById(R.id.email);
        password = findViewById(R.id.password);
        loginButton = findViewById(R.id.Login);
        db = FirebaseFirestore.getInstance();
        auth = FirebaseAuth.getInstance();

        // Check if the user is already logged in
        FirebaseUser currentUser = auth.getCurrentUser();
        if (currentUser != null) {
            // If the user is already logged in, check permission status
            checkPermissionStatus(currentUser.getEmail());
        }

        // Handle the login button click
        loginButton.setOnClickListener(v -> {
            String emailInput = email.getText().toString().trim();
            String passwordInput = password.getText().toString().trim();

            // Check if email and password are not empty
            if (emailInput.isEmpty() || passwordInput.isEmpty()) {
                showAlertDialog("Error", "Please enter both email and password.");
                return;
            }

            // Attempt to authenticate the user
            auth.signInWithEmailAndPassword(emailInput, passwordInput)
                    .addOnCompleteListener(task -> {
                        if (task.isSuccessful()) {
                            // User is authenticated, now check if permissionStatus is true
                            checkPermissionStatus(emailInput);
                        } else {
                            showAlertDialog("Error", "Authentication failed. Please try again.");
                        }
                    });
        });
    }

    private void checkPermissionStatus(String email) {
        // Get the reference to the police collection
        DocumentReference docRef = db.collection("police").document(email);

        docRef.get().addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                DocumentSnapshot document = task.getResult();
                if (document.exists()) {
                    Boolean permissionStatus = document.getBoolean("permissionStatus");

                    // Check if permissionStatus is true
                    if (permissionStatus != null && permissionStatus) {
                        // If permission is granted, proceed to the PoliceHomeActivity
                        navigateToPoliceHome();
                    } else {
                        // Show a dialog if permissionStatus is false or null
                        showAlertDialog("Permission Denied", "You still do not have permission, please wait.");
                    }
                } else {
                    showAlertDialog("Error", "No such user found.");
                }
            } else {
                showAlertDialog("Error", "Failed to fetch user data.");
            }
        });
    }

    private void navigateToPoliceHome() {
        // Navigate to PoliceHomeActivity if the user has permission
        Intent intent = new Intent(PoliceLoginActivity.this, PoliceHomeActivity.class);
        startActivity(intent);
        finish(); // Close the login activity
    }

    private void showAlertDialog(String title, String message) {
        // Show an AlertDialog to display the message
        new AlertDialog.Builder(PoliceLoginActivity.this)
                .setTitle(title)
                .setMessage(message)
                .setCancelable(false)
                .setPositiveButton("OK", (dialog, which) -> dialog.dismiss())
                .show();
    }
}
