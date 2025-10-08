package com.example.checkmycar;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.Button;
import android.widget.Toast;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.common.HybridBinarizer;

import java.util.HashMap;
import java.util.Map;

public class BuyerHomeActivity extends AppCompatActivity {
    Button gallerybutton;
    private static final int PICK_IMAGE = 2;
    CardView qrscanner;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.buyer_home);
        qrscanner = findViewById(R.id.qrscanner);
        gallerybutton = findViewById(R.id.gallerybutton);
        // Handle QR Scanner click (CardView)
        qrscanner.setOnClickListener(v -> {
            // Start QR Scanner Activity (CaptureActivity from ZXing)
            Intent intent = new Intent(BuyerHomeActivity.this, com.journeyapps.barcodescanner.CaptureActivity.class);
            startActivityForResult(intent, 1); // Request code for QR scanner
        });
        // Handle Gallery button click (Upload QR from gallery)
        gallerybutton.setOnClickListener(v -> openGallery());
    }
    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(intent, PICK_IMAGE);
    }
    // Handle the result of selecting an image from the gallery
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == 1 && resultCode == RESULT_OK && data != null) {
            // Handle QR code scan result from CaptureActivity (ZXing)
            String scannedData = data.getStringExtra("SCAN_RESULT");
            handleScannedQRCode(scannedData);
        }

        if (requestCode == PICK_IMAGE && resultCode == RESULT_OK && data != null) {
            Uri selectedImageUri = data.getData();
            if (selectedImageUri != null) {
                scanQRCodeFromGallery(selectedImageUri);
            }
        }
    }
    private void handleScannedQRCode(String scannedData) {
        Log.d("ScannedQRCode", "Scanned QR Code: " + scannedData);
        // Pass the QR data to PoliceQrDetailsActivity
        Intent intent = new Intent(BuyerHomeActivity.this, BuyerQrDetailsActivity.class);
        intent.putExtra("QR_DATA", scannedData); // Pass scanned QR data to next activity
        startActivity(intent); // Start the activity
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
}