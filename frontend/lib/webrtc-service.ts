// For React Native WebRTC

// Enhanced WebRTC detection for React Native
const getWebRTCAPIs = () => {
  // For React Native, try to use react-native-webrtc package
  try {
    const webrtc = require('react-native-webrtc');
    
    // Check if the WebRTC module is properly initialized
    if (webrtc && webrtc.RTCPeerConnection && webrtc.mediaDevices) {
      console.log('🔍 Using react-native-webrtc package');
      
      // Test if we can create a basic peer connection
      try {
        const testConfig = { iceServers: [] };
        const testPc = new webrtc.RTCPeerConnection(testConfig);
        testPc.close(); // Clean up test connection
        
        return { 
          RTCPeerConnection: webrtc.RTCPeerConnection, 
          RTCSessionDescription: webrtc.RTCSessionDescription, 
          RTCIceCandidate: webrtc.RTCIceCandidate, 
          isSupported: true,
          isReal: true
        };
      } catch (testError) {
        console.log('⚠️ react-native-webrtc test failed:', testError.message);
        throw testError;
      }
    }
  } catch (error) {
    console.log('⚠️ react-native-webrtc not available or failed:', error.message);
  }

  // Check for global WebRTC APIs (web)
  const globalObj = (typeof global !== 'undefined') ? global : (typeof window !== 'undefined') ? window : {};
  
  if (globalObj.RTCPeerConnection) {
    console.log('🔍 Using global WebRTC APIs');
    return { 
      RTCPeerConnection: globalObj.RTCPeerConnection, 
      RTCSessionDescription: globalObj.RTCSessionDescription, 
      RTCIceCandidate: globalObj.RTCIceCandidate, 
      isSupported: true,
      isReal: true
    };
  }

  // Fallback mock for development/testing
  console.warn('⚠️ WebRTC APIs not found - creating mock implementation');
  return createMockWebRTCAPIs();
};

const createMockWebRTCAPIs = () => {
  class MockRTCPeerConnection {
    connectionState = 'new';
    onicecandidate: any = null;
    onconnectionstatechange: any = null;
    ondatachannel: any = null;
    private localDescription: any = null;
    private remoteDescription: any = null;
    private isInitiator: boolean = false;

    constructor() {
      console.log('🔧 Mock RTCPeerConnection created for testing');
      
      // Simulate initial state
      setTimeout(() => {
        console.log('🔧 Mock: RTCPeerConnection initialized');
      }, 100);
    }

    createDataChannel(label: string, options?: any) {
      console.log('📡 Mock: Creating data channel:', label);
      this.isInitiator = true;
      
      const mockChannel = {
        readyState: 'connecting' as any,
        send: (data: string) => {
          console.log('📤 Mock: Message sent through P2P channel:', data);
        },
        close: () => {
          console.log('📡 Mock: Data channel closed');
          mockChannel.readyState = 'closed';
          if (mockChannel.onclose) mockChannel.onclose();
        },
        onopen: null as any,
        onmessage: null as any,
        onclose: null as any,
        onerror: null as any
      };
      
      return mockChannel;
    }

    async createOffer() {
      console.log('📞 Mock: Creating WebRTC offer');
      const sessionId = Date.now();
      return { 
        type: 'offer', 
        sdp: `v=0\r\no=- ${sessionId} 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:4ZcD\r\na=ice-pwd:2/1muCWoOi3uVDclU8Ng8T\r\na=ice-options:trickle\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n`
      };
    }

    async createAnswer() {
      console.log('📞 Mock: Creating WebRTC answer');
      const sessionId = Date.now();
      return { 
        type: 'answer', 
        sdp: `v=0\r\no=- ${sessionId} 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:4ZcD\r\na=ice-pwd:2/1muCWoOi3uVDclU8Ng8T\r\na=ice-options:trickle\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:active\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n`
      };
    }

    async setLocalDescription(desc: any) {
      console.log('📞 Mock: Set local description:', desc.type);
      this.localDescription = desc;
      this.connectionState = 'connecting';
      this.onconnectionstatechange?.();
      
      setTimeout(() => {
        console.log('🧊 Mock: Starting ICE candidate gathering...');
        this.simulateIceCandidates();
      }, 200);
    }

    async setRemoteDescription(desc: any) {
      console.log('📞 Mock: Set remote description:', desc.type);
      this.remoteDescription = desc;
      
      if (!this.isInitiator && this.localDescription && this.remoteDescription) {
        setTimeout(() => {
          console.log('🔗 Mock: Both peers have set descriptions, simulating connection...');
          this.simulateConnection();
        }, 1000);
      }
      
      if (this.isInitiator && desc.type === 'answer') {
        setTimeout(() => {
          console.log('🔗 Mock: Received answer, simulating connection...');
          this.simulateConnection();
        }, 1000);
      }
    }

    simulateConnection() {
      setTimeout(() => {
        this.connectionState = 'connected';
        console.log('🔗 Mock: Connection state changed to connected');
        this.onconnectionstatechange?.();
      }, 1500);
    }

    simulateIceCandidates() {
      const candidates = [
        {
          candidate: 'candidate:842163049 1 udp 1677721855 192.168.1.100 54400 typ srflx raddr 192.168.1.100 rport 54400 generation 0 ufrag 4ZcD network-cost 999',
          sdpMLineIndex: 0,
          sdpMid: '0'
        },
        {
          candidate: 'candidate:842163049 1 udp 1677721599 10.0.0.1 54401 typ srflx raddr 10.0.0.1 rport 54401 generation 0 ufrag 4ZcD network-cost 999',
          sdpMLineIndex: 0,
          sdpMid: '0'
        }
      ];

      candidates.forEach((candidateData, index) => {
        setTimeout(() => {
          if (this.onicecandidate) {
            console.log(`🧊 Mock: Generating ICE candidate ${index + 1}:`, candidateData.candidate);
            this.onicecandidate({ candidate: candidateData });
          }
        }, (index + 1) * 300);
      });

      setTimeout(() => {
        if (this.onicecandidate) {
          console.log('🧊 Mock: ICE gathering complete (end-of-candidates)');
          this.onicecandidate({ candidate: null });
        }
      }, candidates.length * 300 + 500);
    }

    async addIceCandidate(candidate: any) {
      console.log('🧊 Mock: Added ICE candidate:', candidate?.candidate || 'end-of-candidates');
      
      if (!candidate && this.localDescription && this.remoteDescription) {
        setTimeout(() => {
          console.log('🔗 Mock: All ICE candidates processed, finalizing connection...');
          this.simulateConnection();
        }, 500);
      }
    }

    close() {
      console.log('📞 Mock: Connection closed');
      this.connectionState = 'closed';
      this.onconnectionstatechange?.();
    }
  }

  class MockRTCSessionDescription {
    type: string;
    sdp: string;

    constructor(init: any) {
      console.log('🔧 Mock RTCSessionDescription created:', init.type);
      this.type = init.type;
      this.sdp = init.sdp;
    }
  }

  class MockRTCIceCandidate {
    candidate: string;
    sdpMLineIndex: number;
    sdpMid: string;

    constructor(init: any) {
      console.log('🔧 Mock RTCIceCandidate created');
      this.candidate = init.candidate;
      this.sdpMLineIndex = init.sdpMLineIndex;
      this.sdpMid = init.sdpMid;
    }
  }

  return {
    RTCPeerConnection: MockRTCPeerConnection,
    RTCSessionDescription: MockRTCSessionDescription,
    RTCIceCandidate: MockRTCIceCandidate,
    isSupported: true,
    isReal: false
  };
};

// Get WebRTC APIs
const { RTCPeerConnection: WebRTCPeerConnection, RTCSessionDescription: WebRTCSessionDescription, RTCIceCandidate: WebRTCIceCandidate, isSupported, isReal } = getWebRTCAPIs();

export interface MessageData {
  messageType: string;
  sender?: string;
  to?: string;
  content?: string;
  messageId?: string;
  userId?: string;
  candidate?: any;
  sdp?: any;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  type: 'sent' | 'received';
}

class WebRTCService {
  private ws: WebSocket | null = null;
  private peerConnection: any = null;
  private dataChannel: any = null;
  private currentUserId: string = '';
  private targetUserId: string = '';
  private isInitiator: boolean = false;
  private isConnectedToSignaling: boolean = false;
  private reconnectInterval: any = null;
  private isWebRTCSupported: boolean = false;
  private isRealWebRTC: boolean = false;
  
  public onConnectionStateChange?: (state: string) => void;
  public onMessageReceived?: (message: ChatMessage) => void;
  public onSignalingStateChange?: (state: string) => void;

  constructor() {
    this.checkWebRTCSupport();
    this.initializePeerConnection();
  }

  private checkWebRTCSupport() {
    this.isWebRTCSupported = isSupported;
    this.isRealWebRTC = isReal || false;
    
    console.log('🔍 WebRTC Environment Check:');
    console.log('  - Platform: React Native');
    console.log('  - RTCPeerConnection available:', !!WebRTCPeerConnection);
    console.log('  - RTCSessionDescription available:', !!WebRTCSessionDescription);
    console.log('  - RTCIceCandidate available:', !!WebRTCIceCandidate);
    console.log('  - Real WebRTC:', this.isRealWebRTC);
    console.log('  - Final WebRTC Support:', this.isWebRTCSupported);
    
    if (this.isWebRTCSupported) {
      const type = this.isRealWebRTC ? 'REAL' : 'Mock';
      console.log(`✅ ${type} WebRTC APIs are available`);
    } else {
      console.warn('⚠️ WebRTC not supported - using mock');
    }
  }

  private initializePeerConnection() {
    // Delay initialization to ensure modules are ready
    setTimeout(() => {
      this.setupPeerConnection();
    }, 100);
  }

  private setupPeerConnection() {
    const configuration = {
        iceServers: [
            // STUN servers
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            
            // TURN servers for relay
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
        ],
        iceCandidatePoolSize: 10
    };

    try {
      this.peerConnection = new WebRTCPeerConnection(configuration);
      const type = this.isRealWebRTC ? 'REAL' : 'Mock';
      console.log(`✅ ${type} RTCPeerConnection created successfully`);

      this.peerConnection.onicecandidate = (event: any) => {
        if (event.candidate) {
          console.log('🧊 ICE candidate generated:', event.candidate.candidate);
          if (this.ws?.readyState === WebSocket.OPEN && this.targetUserId) {
            console.log('📤 Sending ICE candidate to signaling server for:', this.targetUserId);
            this.sendSignalingMessage({
              messageType: 'webrtc_ice_candidate',
              sender: this.currentUserId,
              to: this.targetUserId,
              candidate: {
                candidate: event.candidate.candidate,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                sdpMid: event.candidate.sdpMid,
              }
            });
          }
        } else {
          console.log('🧊 ICE gathering complete (end-of-candidates)');
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || 'unknown';
        const type = this.isRealWebRTC ? 'REAL' : 'Mock';
        console.log(`🔗 ${type} WebRTC Connection State:`, state);
        this.onConnectionStateChange?.(state);
      };

      this.peerConnection.ondatachannel = (event: any) => {
        const type = this.isRealWebRTC ? 'REAL' : 'Mock';
        console.log(`📡 Received ${type} data channel from peer`);
        const channel = event.channel;
        this.setupDataChannel(channel);
      };
    } catch (error) {
      console.error('❌ Failed to create RTCPeerConnection:', error);
      this.isWebRTCSupported = false;
      
      // If real WebRTC failed, fall back to mock
      if (this.isRealWebRTC) {
        console.log('🔄 Falling back to mock WebRTC implementation...');
        this.isRealWebRTC = false;
        
        const mockAPIs = createMockWebRTCAPIs();
        const MockPeerConnection = mockAPIs.RTCPeerConnection;
        
        try {
          this.peerConnection = new MockPeerConnection(configuration);
          this.isWebRTCSupported = true;
          console.log('✅ Mock RTCPeerConnection fallback successful');
          
          // Setup mock handlers
          this.setupMockHandlers();
        } catch (mockError) {
          console.error('❌ Even mock WebRTC failed:', mockError);
        }
      }
    }
  }

  private setupMockHandlers() {
    if (!this.isRealWebRTC && this.peerConnection) {
      // For mock implementation, set up the handlers after creation
      this.peerConnection.onicecandidate = (event: any) => {
        if (event.candidate) {
          console.log('🧊 Mock ICE candidate generated:', event.candidate.candidate);
          if (this.ws?.readyState === WebSocket.OPEN && this.targetUserId) {
            this.sendSignalingMessage({
              messageType: 'webrtc_ice_candidate',
              sender: this.currentUserId,
              to: this.targetUserId,
              candidate: event.candidate
            });
          }
        } else {
          console.log('🧊 Mock ICE gathering complete');
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || 'unknown';
        console.log('🔗 Mock WebRTC Connection State:', state);
        this.onConnectionStateChange?.(state);
      };

      this.peerConnection.ondatachannel = (event: any) => {
        console.log('📡 Received Mock data channel from peer');
        this.setupDataChannel(event.channel);
      };
    }
  }

  private setupDataChannel(channel: any) {
    const type = this.isRealWebRTC ? 'REAL' : 'Mock';
    console.log(`📡 Setting up ${type} data channel, current state:`, channel.readyState);
    this.dataChannel = channel;
    
    channel.onopen = () => {
      console.log(`📡 ${type} Data channel opened - P2P connection established!`);
      console.log('🔗 Ready to send/receive P2P messages');
      this.onConnectionStateChange?.('connected');
    };

    channel.onmessage = (event: any) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);
        console.log(`📨 Received ${type} P2P message from`, message.sender + ':', message.content);
        this.onMessageReceived?.(message);
      } catch (error) {
        console.error('❌ Failed to parse received message:', error);
      }
    };

    channel.onclose = () => {
      console.log(`📡 ${type} Data channel closed`);
      this.onConnectionStateChange?.('disconnected');
    };

    channel.onerror = (error: any) => {
      console.error(`📡 ${type} Data channel error:`, error);
      this.onConnectionStateChange?.('failed');
    };

    // For mock implementation, manually trigger open after delay
    if (!this.isRealWebRTC && channel.readyState === 'connecting') {
      setTimeout(() => {
        if (channel.onopen && channel.readyState !== 'open') {
          console.log('📡 Mock: Manually triggering data channel open event');
          channel.readyState = 'open';
          channel.onopen();
        }
      }, 2000);
    }
  }

  // Auto-connect to signaling server
  async autoConnectToSignaling(userId: string): Promise<void> {
    this.currentUserId = userId;
    
    if (this.isConnectedToSignaling && this.ws?.readyState === WebSocket.OPEN) {
      console.log('🔌 Already connected to signaling server');
      return;
    }

    try {
      const signalingUrl = 'ws://10.80.33.116:9092/signaling';
      await this.connectToSignalingServer(signalingUrl, userId);
      this.startReconnectWatcher();
    } catch (error) {
      console.error('❌ Auto-connect failed, will retry...', error);
      this.scheduleReconnect();
    }
  }

  private startReconnectWatcher() {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setInterval(() => {
      if (!this.isConnectedToSignaling || this.ws?.readyState !== WebSocket.OPEN) {
        console.log('🔄 Connection lost, attempting to reconnect...');
        this.autoConnectToSignaling(this.currentUserId);
      }
    }, 5000);
  }

  private scheduleReconnect() {
    setTimeout(() => {
      if (!this.isConnectedToSignaling) {
        this.autoConnectToSignaling(this.currentUserId);
      }
    }, 3000);
  }

  async connectToSignalingServer(signalingUrl: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.currentUserId = userId;
        this.ws = new WebSocket(signalingUrl);

        this.ws.onopen = () => {
          console.log('🔌 Connected to signaling server');
          this.isConnectedToSignaling = true;
          
          console.log('📝 Registering user with signaling server:', userId);
          this.sendSignalingMessage({
            messageType: 'register',
            userId: userId
          });
          this.onSignalingStateChange?.('connected');
          resolve();
        };

        this.ws.onmessage = async (event) => {
          try {
            const data: MessageData = JSON.parse(event.data);
            await this.handleSignalingMessage(data);
          } catch (error) {
            console.error('❌ Failed to parse signaling message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ Signaling WebSocket error:', error);
          this.isConnectedToSignaling = false;
          this.onSignalingStateChange?.('error');
          reject(new Error('Failed to connect to signaling server'));
        };

        this.ws.onclose = () => {
          console.log('🔌 Disconnected from signaling server');
          this.isConnectedToSignaling = false;
          this.onSignalingStateChange?.('disconnected');
        };

        setTimeout(() => {
          if (!this.isConnectedToSignaling) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  private async handleSignalingMessage(data: MessageData) {
    console.log('📡 Received signaling message:', data.messageType, 'from:', data.sender);

    try {
      switch (data.messageType) {
        case 'signaling_connected':
          console.log('✅ Signaling connection established');
          break;

        case 'registration_success':
          console.log('✅ User registered successfully as:', this.currentUserId);
          break;

        case 'webrtc_offer':
          console.log('📞 Received WebRTC offer from:', data.sender);
          await this.handleOffer(data);
          break;

        case 'webrtc_answer':
          console.log('📞 Received WebRTC answer from:', data.sender);
          await this.handleAnswer(data);
          break;

        case 'webrtc_ice_candidate':
          console.log('🧊 Received ICE candidate from:', data.sender);
          await this.handleIceCandidate(data);
          break;
      }
    } catch (error) {
      console.error('❌ Error handling signaling message:', error);
    }
  }

  async initiateCall(targetUserId: string): Promise<void> {
    console.log('🚀 ===== INITIATING WEBRTC CALL =====');
    console.log('🎯 Target user:', targetUserId);
    console.log('🔌 Signaling connected:', this.isConnectedToSignaling);
    console.log('📡 WebRTC supported:', this.isWebRTCSupported);

    if (!this.isConnectedToSignaling) {
      throw new Error('Not connected to signaling server');
    }

    this.targetUserId = targetUserId;
    this.isInitiator = true;

    console.log('🔄 Resetting peer connection for new call...');
    
    try {
      if (this.peerConnection) {
        this.peerConnection.close();
      }
      this.setupPeerConnection();

      console.log('📡 Creating data channel...');
      this.dataChannel = this.peerConnection!.createDataChannel('chat', {
        ordered: true
      });
      this.setupDataChannel(this.dataChannel);

      console.log('📞 Creating WebRTC offer...');
      const offer = await this.peerConnection!.createOffer();
      console.log('📞 Offer created:', offer.type);
      
      await this.peerConnection!.setLocalDescription(offer);
      console.log('📞 Local description set - ICE gathering should start now');

      console.log('📤 Sending WebRTC offer to signaling server...');
      this.sendSignalingMessage({
        messageType: 'webrtc_offer',
        sender: this.currentUserId,
        to: targetUserId,
        sdp: {
          type: offer.type,
          sdp: offer.sdp
        }
      });

      console.log('✅ WebRTC offer sent successfully!');
      console.log('⏳ Waiting for answer from:', targetUserId);
    } catch (error) {
      console.error('❌ Failed to create WebRTC offer:', error);
      throw error;
    }
  }

  private async handleOffer(data: MessageData) {
    try {
      console.log('📞 ===== HANDLING WEBRTC OFFER =====');
      console.log('📞 Offer from:', data.sender);
      
      this.targetUserId = data.sender!;
      this.isInitiator = false;

      console.log('🔄 Resetting peer connection for incoming call...');
      if (this.peerConnection) {
        this.peerConnection.close();
      }
      this.setupPeerConnection();

      console.log('📞 Setting remote description (offer)...');
      const offer = new WebRTCSessionDescription(data.sdp);
      await this.peerConnection!.setRemoteDescription(offer);
      console.log('✅ Remote description set');
      
      console.log('📞 Creating answer...');
      const answer = await this.peerConnection!.createAnswer();
      console.log('📞 Answer created:', answer.type);
      
      await this.peerConnection!.setLocalDescription(answer);
      console.log('✅ Local description (answer) set - ICE gathering should start');

      console.log('📤 Sending answer back to:', this.targetUserId);
      this.sendSignalingMessage({
        messageType: 'webrtc_answer',
        sender: this.currentUserId,
        to: this.targetUserId,
        sdp: {
          type: answer.type,
          sdp: answer.sdp
        }
      });

      console.log('✅ Answer sent successfully!');
    } catch (error) {
      console.error('❌ Failed to handle WebRTC offer:', error);
    }
  }

  private async handleAnswer(data: MessageData) {
    try {
      console.log('📞 ===== HANDLING WEBRTC ANSWER =====');
      console.log('📞 Answer from:', data.sender);
      
      const answer = new WebRTCSessionDescription(data.sdp);
      await this.peerConnection!.setRemoteDescription(answer);
      console.log('✅ Remote description (answer) set - connection should establish soon');
    } catch (error) {
      console.error('❌ Failed to handle WebRTC answer:', error);
    }
  }

  private async handleIceCandidate(data: MessageData) {
    try {
      console.log('🧊 ===== HANDLING ICE CANDIDATE =====');
      console.log('🧊 ICE candidate from:', data.sender);
      
      if (data.candidate) {
        const candidate = new WebRTCIceCandidate(data.candidate);
        await this.peerConnection!.addIceCandidate(candidate);
        console.log('✅ ICE candidate added successfully');
      } else {
        console.log('🧊 End-of-candidates received');
      }
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error);
    }
  }

  sendMessage(content: string): void {
    console.log('📤 Attempting to send P2P message to', this.targetUserId + ':', content);
    console.log('📡 Data channel state:', this.dataChannel?.readyState);
    
    if (this.dataChannel?.readyState === 'open') {
      const message: ChatMessage = {
        id: Date.now().toString(),
        content,
        sender: this.currentUserId,
        timestamp: Date.now(),
        type: 'sent'
      };

      try {
        this.dataChannel.send(JSON.stringify(message));
        console.log('✅ P2P message sent successfully to:', this.targetUserId);
        console.log('📊 Message data:', { from: this.currentUserId, to: this.targetUserId, content });
      } catch (error) {
        console.error('❌ Failed to send P2P message:', error);
        throw new Error('Failed to send message via P2P connection');
      }
    } else {
      console.warn('⚠️ P2P channel not ready, state:', this.dataChannel?.readyState);
      throw new Error('P2P connection not established');
    }
  }

  private sendSignalingMessage(message: MessageData) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        console.log('📤 Sending signaling message:', message.messageType, 'to:', message.to || 'server');
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Failed to send signaling message:', error);
      }
    } else {
      console.error('❌ Signaling server not connected - cannot send message:', message.messageType);
    }
  }

  disconnect() {
    try {
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      this.setupPeerConnection();
    } catch (error) {
      console.error('❌ Error during disconnect:', error);
    }
  }

  fullDisconnect() {
    try {
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.isConnectedToSignaling = false;
    } catch (error) {
      console.error('❌ Error during full disconnect:', error);
    }
  }

  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'new';
  }

  getSignalingState(): string {
    return this.isConnectedToSignaling ? 'connected' : 'disconnected';
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  isWebRTCAvailable(): boolean {
    return this.isWebRTCSupported;
  }

  getConnectionDetails(): string {
    const type = this.isRealWebRTC ? 'REAL' : 'Mock';
    return `WebRTC: ${type}, State: ${this.getConnectionState()}`;
  }
}

export const webRTCService = new WebRTCService();