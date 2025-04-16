# SecureConnect


## Introduction to WebRTC Concepts

The first concept to cover is the **signaling server**. It's important to note that the signaling server is not technically a part of WebRTC itself. Instead, it is an auxiliary component that helps exchange the necessary data to establish and maintain the connection. For signaling, we can use any communication method, such as **WebSocket** or **XMLHttpRequest**.

## STUN and TURN Servers

A **STUN server** provides information about our internet connection, such as network path, NAT details, and more. Before initiating a connection with the remote peer, we first obtain this information via the STUN server. Then, we send this information to the other party using the signaling server.

In many cases, STUN alone may not be sufficient. That’s where **TURN servers** come into play. TURN is used when STUN fails. Unlike STUN, TURN servers are usually not free, as they relay the actual traffic between peers and thus incur higher costs. When a direct peer-to-peer (P2P) connection is not possible, the traffic is routed through the TURN server.

## Exchanging Connection Data

To establish a connection between two clients, initial data needs to be exchanged. One key element is the **SDP (Session Description Protocol)**. SDP contains information about the type of media each party supports, allowing them to establish a compatible connection. This data is exchanged via the signaling server.

After the SDP exchange, the next step is sending **ICE candidates**, which include network-related information obtained from the STUN server.

## WebRTC Connection Flow

1. The initiating client sends a **WebRTC Offer**, which includes its SDP.
2. The receiving client responds with a **WebRTC Answer**, which includes its own SDP.
3. ICE candidates are exchanged between both clients.
4. If a direct connection cannot be established, a TURN server is used as a fallback to relay traffic.

## Creating a Self-Signed SSL Certificate

To use secure WebSocket (WSS) or HTTPS in your signaling server, you need an SSL certificate. Here’s how to create a self-signed certificate:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout server.key \
    -out server.crt
```

Move the generated files to a secure location:

```bash
sudo mkdir /etc/ssl/self-signed
sudo mv server.key /etc/ssl/self-signed/
sudo mv server.crt /etc/ssl/self-signed/
```
