import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';
import { consultationsApi } from '../services/api';

export default function VideoCallPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
    const [doctorJoined, setDoctorJoined] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Mock Consultation Data
    const [consultation, setConsultation] = useState<any>(null);

    useEffect(() => {
        // Fetch details
        const fetchDetails = async () => {
            try {
                if (id) {
                    const res = await consultationsApi.getDetails(id);
                    setConsultation(res.data.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchDetails();

        // Connect Camera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => console.error("Camera error:", err));
        }

        // Simulate Doctor Joining
        const timer = setTimeout(() => {
            setDoctorJoined(true);
            setStatus('connected');
        }, 5000); // Doctor joins after 5 seconds

        return () => {
            clearTimeout(timer);
            // Stop tracks
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [id]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (status === 'connected') {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = async () => {
        if (window.confirm("End the consultation?")) {
            setStatus('ended');
            try {
                if (id) await consultationsApi.end(id, 'Patient ended call');
            } catch (e) { console.error(e); }
            navigate('/consultations/my');
        }
    };

    return (
        <div className="h-screen bg-gray-900 flex flex-col relative overflow-hidden">
            {/* Header / Remote Video (Mock Doctor) */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {doctorJoined ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img
                            src={consultation?.doctor_image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800"}
                            className="w-full h-full object-cover opacity-80"
                            alt="Doctor"
                        />
                        <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded-full text-white backdrop-blur-md">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {consultation?.doctor_name || 'Dr. Sharma'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-white">
                        <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                            <User size={48} className="text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Waiting for doctor...</h2>
                        <p className="text-gray-400">Dr. {consultation?.doctor_name?.split(' ')[1] || 'Doctor'} will join shortly</p>
                    </div>
                )}
            </div>

            {/* Self View (Pip) */}
            <motion.div
                className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 z-10"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                />
                {!isVideoOn && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <VideoOff className="text-white" size={24} />
                    </div>
                )}
            </motion.div>

            {/* Controls Bar */}
            <div className="bg-gray-900/90 backdrop-blur-md p-6 pb-10">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button
                        onClick={() => setIsMicOn(!isMicOn)}
                        className={`p-4 rounded-full transition ${isMicOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={`p-4 rounded-full transition ${isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>

                    <button
                        onClick={handleEndCall}
                        className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition transform hover:scale-105 shadow-lg shadow-red-600/30"
                    >
                        <PhoneOff size={28} />
                    </button>

                    <div className="text-white font-mono text-lg bg-gray-800 px-4 py-2 rounded-lg">
                        {status === 'connected' ? formatTime(timeElapsed) : '--:--'}
                    </div>
                </div>
            </div>
        </div>
    );
}
