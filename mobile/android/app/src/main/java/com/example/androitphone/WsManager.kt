package com.example.androitphone

import okhttp3.*
import okio.ByteString
import android.util.Log

class WsManager(private val url: String = "ws://10.0.2.2:3000") {
    private val client = OkHttpClient()
    private var ws: WebSocket? = null

    fun connect(deviceId: String) {
        val request = Request.Builder().url(url).build()
        ws = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.i("WsManager", "connected")
                webSocket.send("{\"type\":\"auth\",\"deviceId\":\"$deviceId\",\"token\":\"x\"}")
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.i("WsManager", "message: $text")
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                Log.i("WsManager", "bytes")
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                webSocket.close(1000, null)
                Log.i("WsManager", "closing: $code / $reason")
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("WsManager", "failure", t)
            }
        })
    }

    fun sendRelay(to: String, payload: String) {
        val msg = "{\"type\":\"relay\",\"to\":\"$to\",\"payload\":{\"text\":\"$payload\"}}"
        ws?.send(msg)
    }

    fun close() {
        ws?.close(1000, "bye")
    }
}
