package com.example.checkmycar;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class LoginActivity extends AppCompatActivity {
    Button owner,police,buyer,police_registration;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.login);
        owner=findViewById((R.id.owner));
        police=findViewById((R.id.police));
        buyer=findViewById((R.id.buyer));
        police_registration=findViewById((R.id.police_registration));

        owner.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openOwnerActivity();
            }
        });
        police.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openPoliceActivity();
            }
        });
        buyer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openBuyerActivity();
            }
        });
        police_registration.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openpoliceregActivity();
            }
        });
    }
    public void openOwnerActivity() {
        Intent intent = new Intent(this,OwnerLoginActivity.class);
        startActivity(intent);
    }
    public void openPoliceActivity() {
        Intent intent = new Intent(this,PoliceLoginActivity.class);
        startActivity(intent);
    }
    public void openBuyerActivity() {
        Intent intent = new Intent(this,BuyerHomeActivity.class);
        startActivity(intent);
    }
    public void openpoliceregActivity() {
        Intent intent = new Intent(this,RegisterActivity.class);
        startActivity(intent);
    }
}