import React from 'react'
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

function Room() {
  const {roomId} = useParams();

  const myMeeting = async(element)=>{
    const appId = 1222520922
    const serverSecret = "8101e7bd58f90ddcbf18e3b1e6f2d664"
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomId,
        Date.now().toString(),
        "Kumar"
    );
    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
        container: element,
        sharedLinks :[
            {
                name: "Copy Link",
                url: `${window.location.origin}/room/${roomId}`
            }
        ],
        scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
        },
        showScreenSharingButton: true,
        // showTurnOffMicrophoneButton: true,
        // showTurnOffCameraButton: true,
        showLeaveButton: true,
        showInviteButton: true,
        showAudioVolumeIndicator: true,
        
    });
  }
  return (
    <div className='w-screen h-screen'>
        <div ref={myMeeting}/>
    </div>
  )
}

export default Room
