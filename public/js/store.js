let state = {
    socketId: null,
    localStream: null,
    remoteStream: null,
    screenSharingActive: false,  
    screenSharingStream: null,
    allowConnectionsFromLurkers: false,
};


export const setSocketId = (sockerId) => {
    state = {
        ...state,
        socketId: sockerId,
    };
};

export const setLocalStream = (stream) => {
    state = {
        ...state,
        localStream: stream,
    };
};

export const setAllowConnectionsFromLurkers = (allowConnection) => {
    state = {
        ...state,
        allowConnectionsFromLurkers: allowConnection,
    };
};


export const setScreenSharingActive = (screenSharing) => {
    state = {
        ...state,
        screenSharingActive: screenSharing,
    };
};

export const setScreenSharingStream = (stream) => {
    state = {
        ...state,
        screenSharingStream: stream,
    };
};

export const setRemoteStream = (stream) => {
    state = {
        ...state,
        remoteStream: stream,
    };
};

export const getState = () => {
    return state;
};