package com.example.checkmycar;

import android.graphics.Bitmap;
import com.google.zxing.LuminanceSource;

public class BitmapLuminanceSource extends LuminanceSource {
    private final Bitmap bitmap;

    public BitmapLuminanceSource(Bitmap bitmap) {
        super(bitmap.getWidth(), bitmap.getHeight());
        this.bitmap = bitmap;
    }

    @Override
    public byte[] getRow(int y, byte[] row) {
        bitmap.getPixels(new int[bitmap.getWidth()], 0, bitmap.getWidth(), 0, y, bitmap.getWidth(), 1);
        return convertToGrayscale(row);
    }

    @Override
    public byte[] getMatrix() {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        int[] pixels = new int[width * height];
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
        byte[] matrix = new byte[width * height];
        for (int i = 0; i < pixels.length; i++) {
            matrix[i] = (byte) (0.299 * ((pixels[i] >> 16) & 0xFF) + 0.587 * ((pixels[i] >> 8) & 0xFF) + 0.114 * (pixels[i] & 0xFF));
        }
        return matrix;
    }

    private byte[] convertToGrayscale(byte[] row) {
        int width = bitmap.getWidth();
        for (int i = 0; i < width; i++) {
            int pixel = bitmap.getPixel(i, row.length);
            row[i] = (byte) (0.299 * ((pixel >> 16) & 0xFF) + 0.587 * ((pixel >> 8) & 0xFF) + 0.114 * (pixel & 0xFF));
        }
        return row;
    }
}
