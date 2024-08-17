import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { Audio } from "expo-av";
import Header from "./src/components/Header";
import Timer from "./src/components/Timer";

const colors = [
    "#f7dc6f",
    "#a2d9ce",
    "#d7bde2"
];

export default App = () => {
    const [isWorking, setIsWorking] = useState(false);
    const [time, setTime] = useState(25 * 60);
    const [currentTime, setCurrentTime] = useState("POMO" | "SHORT" | "BREAK");
    const [isActive, setIsActive] = useState(false);
    const optionsTimes = {0: 25, 1: 5, 2: 15};
    const soundRef = useRef(null);

    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(interval);
                        setIsActive(false);
                        stopMusic(soundRef);
                        stopSound();
                        return optionsTimes[currentTime] * 60;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            clearInterval(interval);
            stopMusic(soundRef);
            stopSound();
        }

        return () => clearInterval(interval);
    }, [isActive]);

    useEffect(() => {
        if (time === 0) {
            stopMusic(soundRef);
            stopSound();
        }
    }, [time]);

    async function stopMusic(soundRef) {
        if (soundRef.current) {
            try {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            } catch (error) {
                console.error("Error stopping music:", error.message, error.stack);
            }
        }
    }
    
    async function playMusic(soundRef) {
        if (!soundRef.current) {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require("./assets/audio/music.mp3"),
                    { isLooping: true }
                );
                soundRef.current = sound;
                await sound.playAsync();
            } catch (error) {
                console.error("Error playing music:", error.message, error.stack);
            }
        }
    }
    
    async function playSound() {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require("./assets/audio/click.mp3")
            );
            await sound.playAsync();
        } catch (error) {
            console.error("Error playing sound:", error.message, error.stack);
        }
    }
    
    async function stopSound() {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require("./assets/audio/stop.mp3")
            );
            await sound.playAsync();
            // Esperar a que el sonido termine antes de descargarlo
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            console.error("Error stopping sound:", error.message, error.stack);
        }
    }

    function handleStartStop() {
        setIsActive(!isActive);
        playSound();
        if (!isActive) {
            setTime(optionsTimes[currentTime] * 60);
            playMusic(soundRef);
        } else {
            stopMusic(soundRef);
        }
    }

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={[styles.container, {backgroundColor: colors[currentTime], paddingHorizontal: 15}]}>
                <StatusBar style={{backgroundColor: colors[currentTime]}} />
                <Text style={styles.text}>Pomodoro</Text>
                <Header setTime={setTime} currentTime={currentTime} setCurrentTime={setCurrentTime}></Header>
                <Timer time={time}/>
                <TouchableOpacity style={styles.button} onPress={handleStartStop}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>
                        {isActive ? "STOP" : "START"}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontSize: 30,
        fontWeight: "bold",
    },
    button: {
        backgroundColor: '#333',
        padding: 15,
        marginTop: 15,
        borderRadius: 15,
        alignItems: 'center'
    }
});