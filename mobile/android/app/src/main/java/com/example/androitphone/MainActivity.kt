package com.example.androitphone

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material.Text
import androidx.compose.material.MaterialTheme
import androidx.compose.runtime.Composable

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AppRoot() }
    }
}

@Composable
fun AppRoot(){
    MaterialTheme {
        Text("AndroitPhone - pairing + WS client (skeleton)")
    }
}

// TODO: add WebSocket client code using OkHttp to connect to backend and implement pairing UI
