package com.example.checkmycar;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.bumptech.glide.Glide;
import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;

import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.common.HybridBinarizer;

import java.util.HashMap;
import java.util.Map;

public class OwnerHomeActivity extends AppCompatActivity {
    ImageView logout;
    Button downloadQr, gallerybutton,track,uploadimage;
    // SharedPreferences key for tracking login status
    private static final String PREFS_NAME = "UserPrefs";
    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";
    TextView registrationNumTextView;
    FirebaseFirestore db;
    ProgressBar progressBar,progressBar2;
    CardView qrscanner;
    ImageView image;
    private FirebaseStorage storage;
    private static final int PICK_IMAGE = 2;  // Request code for picking image from gallery
    private static final int PICK_IMAGE_REQUEST = 71;
    private String registration;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.owner_home);

        // Initialize views
        logout = findViewById(R.id.logout);
        downloadQr = findViewById(R.id.downloadQr);
        registrationNumTextView = findViewById(R.id.registrationNumTextView);
        db = FirebaseFirestore.getInstance();
        progressBar = findViewById(R.id.progressBar);
        progressBar2 = findViewById(R.id.progressBar2);
        qrscanner = findViewById(R.id.qrscanner);
        gallerybutton = findViewById(R.id.gallerybutton);
        track = findViewById(R.id.track);
        image = findViewById(R.id.image);
        uploadimage = findViewById(R.id.uploadimage);

        // Set an OnClickListener for the logout button
        logout.setOnClickListener(v -> showLogoutDialog());
        // Initialize Firebase Storage
        storage = FirebaseStorage.getInstance();
        // Retrieve the registration number from SharedPreferences
        SharedPreferences prefs = getSharedPreferences("UserPrefs", MODE_PRIVATE);
        String registrationNumber = prefs.getString("REGISTER_NUMBER", ""); // Default to empty if not found
        registration = prefs.getString("REGISTER_NUMBER", "");
       // Fetch existing image if available
        if (!registrationNumber.isEmpty()) {
            fetchImageFromFirestore(registrationNumber);
        }

        // Handle upload image button click
        uploadimage.setOnClickListener(v -> openImagePicker());
        // Check if registration number exists and display it
        if (!registrationNumber.isEmpty()) {
            registrationNumTextView.setText(registrationNumber);
        } else {
            registrationNumTextView.setText("Not available");
        }
        // Handle the Track button click
        track.setOnClickListener(v -> {
            if (!registrationNumber.isEmpty()) {
                // Pass the registration number to the next activity
                Intent intent = new Intent(OwnerHomeActivity.this, OwnerMaintenanceActivity.class);
                intent.putExtra("REGISTRATION_NUMBER", registrationNumber); // Pass registration number
                startActivity(intent); // Navigate to OwnerMaintenanceActivity
            } else {
                Snackbar.make(v, "Registration Number is not available", Snackbar.LENGTH_SHORT).show();
            }
        });
        // Handle QR code download
        downloadQr.setOnClickListener(v -> {
            if (!registrationNumber.isEmpty()) {
                fetchQrImageLink(registrationNumber);
                progressBar.setVisibility(ProgressBar.VISIBLE);
            } else {
                Snackbar.make(v, "Registration Number is not available", Snackbar.LENGTH_SHORT).show();
            }
        });

        // Handle QR Scanner click (CardView)
        qrscanner.setOnClickListener(v -> {
            // Start QR Scanner Activity (CaptureActivity from ZXing)
            Intent intent = new Intent(OwnerHomeActivity.this, com.journeyapps.barcodescanner.CaptureActivity.class);
            startActivityForResult(intent, 1); // Request code for QR scanner
        });

        // Handle Gallery button click (Upload QR from gallery)
        gallerybutton.setOnClickListener(v -> openGallery());
    }
    // Open the image picker (gallery)
    private void openImagePicker() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(intent, PICK_IMAGE_REQUEST);
    }
    // Handle the result of image selection
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

        // Handle image picking for uploading the image to Firebase Storage
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null) {
            Uri selectedImageUri = data.getData();

            // Upload the image to Firebase Storage
            uploadImageToFirebaseStorage(selectedImageUri);
        }
    }


    // Upload image to Firebase Storage
    // Upload image to Firebase Storage
    private void uploadImageToFirebaseStorage(Uri imageUri) {
        if (imageUri != null) {
            progressBar2.setVisibility(View.VISIBLE); // Show progress bar while uploading

            // Create a storage reference with the registration number
            StorageReference storageReference = storage.getReference().child("vehicle_images/" + registration + ".jpg");

            // Upload the image
            UploadTask uploadTask = storageReference.putFile(imageUri);
            uploadTask.addOnSuccessListener(taskSnapshot -> {
                // Get the image URL after upload
                storageReference.getDownloadUrl().addOnSuccessListener(uri -> {
                    String imageUrl = uri.toString();

                    // Save the image URL in Firestore
                    saveImageUrlToFirestore(imageUrl);
                });
            }).addOnFailureListener(e -> {
                // Handle the failure case
                progressBar2.setVisibility(View.GONE);
                Snackbar.make(findViewById(android.R.id.content), "Image upload failed: " + e.getMessage(), Snackbar.LENGTH_SHORT).show();
            });
        }
    }


    // Save the image URL to Firestore
    private void saveImageUrlToFirestore(String imageUrl) {
        // Create a Map to store the image URL
        Map<String, Object> imageData = new HashMap<>();
        imageData.put("imageUrl", imageUrl);

        // Reference to Firestore and the collection "vehicle_image" with document ID as registration number
        DocumentReference docRef = db.collection("vehicle_image").document(registration);

        // Save the image URL in Firestore
        docRef.set(imageData)
                .addOnSuccessListener(aVoid -> {
                    // Hide the progress bar and show success message
                    progressBar2.setVisibility(View.GONE);
                    Snackbar.make(findViewById(android.R.id.content), "Image uploaded successfully!", Snackbar.LENGTH_SHORT).show();
                })
                .addOnFailureListener(e -> {
                    // Handle failure
                    progressBar2.setVisibility(View.GONE);
                    Snackbar.make(findViewById(android.R.id.content), "Error saving image URL: " + e.getMessage(), Snackbar.LENGTH_SHORT).show();
                });
    }

    // Fetch the image URL from Firestore and display it in ImageView
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
        Intent intent = new Intent(OwnerHomeActivity.this, QrDetailsActivity.class);
        intent.putExtra("QR_DATA", scannedData); // Pass scanned QR data to next activity
        startActivity(intent); // Start the activity
    }

    // Method to open the gallery for selecting QR image
    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(intent, PICK_IMAGE);
    }

    private void fetchQrImageLink(String registrationNumber) {
        DocumentReference docRef = db.collection("vehicleRegistrations").document(registrationNumber);
        docRef.get().addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                DocumentSnapshot documentSnapshot = task.getResult();
                if (documentSnapshot.exists()) {
                    String qrImageUrl = documentSnapshot.getString("qr");

                    if (qrImageUrl != null && !qrImageUrl.isEmpty()) {
                        downloadQrImage(qrImageUrl);
                    } else {
                        progressBar.setVisibility(ProgressBar.GONE);
                        Snackbar.make(downloadQr, "QR Image not found", Snackbar.LENGTH_SHORT).show();
                    }
                } else {
                    progressBar.setVisibility(ProgressBar.GONE);
                    Snackbar.make(downloadQr, "No such registration number found", Snackbar.LENGTH_SHORT).show();
                }
            } else {
                progressBar.setVisibility(ProgressBar.GONE);
                Snackbar.make(downloadQr, "Error fetching QR image", Snackbar.LENGTH_SHORT).show();
            }
        });
    }

    private void downloadQrImage(String qrImageUrl) {
        Uri uri = Uri.parse(qrImageUrl);
        DownloadManager.Request request = new DownloadManager.Request(uri);
        request.setTitle("QR Code Image");
        request.setDescription("Downloading QR code...");
        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "qr_image.png");
        DownloadManager downloadManager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
        if (downloadManager != null) {
            downloadManager.enqueue(request);
            progressBar.setVisibility(ProgressBar.GONE);
            Toast.makeText(this, "Downloading QR Image", Toast.LENGTH_SHORT).show();
        } else {
            progressBar.setVisibility(ProgressBar.GONE);
            Toast.makeText(this, "Download Manager not available", Toast.LENGTH_SHORT).show();
        }
    }

    private void showLogoutDialog() {
        new AlertDialog.Builder(OwnerHomeActivity.this)
                .setMessage("Are you sure you want to log out?")
                .setCancelable(false)
                .setPositiveButton("Yes", (dialog, id) -> logoutUser())
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void logoutUser() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(KEY_IS_LOGGED_IN, false);
        editor.apply();

        Intent intent = new Intent(OwnerHomeActivity.this, LoginActivity.class);
        startActivity(intent);
        finish();
    }
}