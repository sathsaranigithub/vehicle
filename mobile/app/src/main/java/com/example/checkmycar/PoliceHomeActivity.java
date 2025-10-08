package com.example.checkmycar;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import com.google.firebase.auth.FirebaseAuth;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.common.HybridBinarizer;

import java.util.HashMap;
import java.util.Map;

public class PoliceHomeActivity extends AppCompatActivity {
    CardView qrscanner;
    Button gallerybutton;
    ImageView logout;
    private static final int PICK_IMAGE = 2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.police_home);

        qrscanner = findViewById(R.id.qrscanner);
        gallerybutton = findViewById(R.id.gallerybutton);
        logout = findViewById(R.id.logout);

        // Handle QR Scanner click (CardView)
        qrscanner.setOnClickListener(v -> {
            // Start QR Scanner Activity (CaptureActivity from ZXing)
            Intent intent = new Intent(PoliceHomeActivity.this, com.journeyapps.barcodescanner.CaptureActivity.class);
            startActivityForResult(intent, 1); // Request code for QR scanner
        });

        // Handle Gallery button click (Upload QR from gallery)
        gallerybutton.setOnClickListener(v -> openGallery());

        // Handle Logout button click
        logout.setOnClickListener(v -> showLogoutDialog());
    }

    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(intent, PICK_IMAGE);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        // Handle QR code scan result from CaptureActivity (ZXing)
        if (requestCode == 1 && resultCode == RESULT_OK && data != null) {
            String scannedData = data.getStringExtra("SCAN_RESULT");
            handleScannedQRCode(scannedData);
        }

        // Handle image picking for QR code scanning
        if (requestCode == PICK_IMAGE && resultCode == RESULT_OK && data != null) {
            Uri selectedImageUri = data.getData();
            if (selectedImageUri != null) {
                scanQRCodeFromGallery(selectedImageUri);
            }
        }
    }

    // Method to scan QR code from an image selected from the gallery
    private void scanQRCodeFromGallery(Uri selectedImageUri) {
        try {
            Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), selectedImageUri);
            MultiFormatReader reader = new MultiFormatReader();
            Map<DecodeHintType, Object> hints = new HashMap<>();
            hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
            BinaryBitmap binaryBitmap = new BinaryBitmap(new HybridBinarizer(new BitmapLuminanceSource(bitmap)));
            Result result = reader.decode(binaryBitmap, hints);

            if (result != null) {
                handleScannedQRCode(result.getText());
            } else {
                Toast.makeText(this, "No QR code found in image", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(this, "Error scanning QR image", Toast.LENGTH_SHORT).show();
        }
    }

    private void handleScannedQRCode(String scannedData) {
        Log.d("ScannedQRCode", "Scanned QR Code: " + scannedData);
        // Pass the QR data to PoliceQrDetailsActivity
        Intent intent = new Intent(PoliceHomeActivity.this, QrDetailsActivity.class);
        intent.putExtra("QR_DATA", scannedData); // Pass scanned QR data to next activity
        startActivity(intent); // Start the activity
    }

    private void showLogoutDialog() {
        // Show an AlertDialog to confirm logout
        new AlertDialog.Builder(PoliceHomeActivity.this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to log out?")
                .setCancelable(false)
                .setPositiveButton("Yes", (dialog, which) -> logoutUser())
                .setNegativeButton("No", (dialog, which) -> dialog.dismiss())
                .show();
    }

    private void logoutUser() {
        // Perform logout
        FirebaseAuth.getInstance().signOut();

        // Navigate to LoginActivity after logout
        Intent intent = new Intent(PoliceHomeActivity.this, PoliceLoginActivity.class);
        startActivity(intent);
        finish(); // Close the current activity (PoliceHomeActivity)
    }
}
