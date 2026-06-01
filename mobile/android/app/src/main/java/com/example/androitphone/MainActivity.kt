package com.example.androitphone

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material.Text
import androidx.compose.material.MaterialTheme
import androidx.compose.runtime.Composable
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString
import android.util.Log

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AppRoot() }

        // Start a simple WebSocket client (connects to backend)
        val client = OkHttpClient()
        val request = Request.Builder().url("ws://10.0.2.2:3000").build() // emulator: host machine
        val ws = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: okhttp3.Response) {
                Log.i("WS", "connected")
                // authenticate as device-A (prototype)
                webSocket.send("{\"type\":\"auth\",\"deviceId\":\"device-A\",\"token\":\"x\"}")
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.i("WS", "msg: $text")
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                Log.i("WS", "bytes: ${bytes.hex()}")
            }
        })
        // client.dispatcher.executorService.shutdown() // keep running
    }
}

@Composable
fun AppRoot(){
    MaterialTheme {
        Text("AndroitPhone - pairing + WS client (skeleton)")
    }
}

// TODO: add WebSocket client code using OkHttp to connect to backend and implement pairing UI
