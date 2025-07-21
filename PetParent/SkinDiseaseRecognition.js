import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { colors } from "../theme/colors";

const SkinDiseaseRecognition = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    (async () => {
      // Request permission to access the media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to your photo library to upload images.");
      }
    })();
  }, []);

  const pickImage = async () => {
    setLoading(true);
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        // Remove base64: true as we will send it as a blob
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        // Pass the URI to analyzeImage for sending as a blob
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
    setLoading(false);
  };

  const analyzeImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      });

      const response = await axios({
        method: "POST",
        url: "http://10.211.0.23:5000/detect-skin-disease", // Updated to your computer's local IP
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.detections && response.data.detections.length > 0) {
        // Display all detected diseases
        const detectedDiseases = response.data.detections.map(det => det.label).join(", ");
        const fullOutputImageUrl = `http://10.211.0.23:5000${response.data.output_image}`;
        setResult({
          disease: detectedDiseases,
          confidence: "N/A", // Confidence is not directly provided per disease in the current Flask response
          output_image: fullOutputImageUrl,
        });
      } else {
        Alert.alert("No Results", "No skin diseases detected");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert("Error", "Failed to analyze image. Please ensure your Flask server is running.");
    } finally {
      setLoading(false); // Ensure loading is set to false in finally block
    }
  };

  return (
    <View style={styles.container}>
      {result ? (
        <View style={styles.resultContainer}>
          <Image source={{ uri: result.output_image }} style={styles.previewImage} />
          <Text style={styles.resultText}>Detected Condition(s): {result.disease}</Text>
          {/* <Text style={styles.resultText}>Confidence: {result.confidence}</Text> */}

          <TouchableOpacity style={styles.button} onPress={() => setResult(null)}>
            <Text style={styles.buttonText}>Upload Another Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.overlay}>
          <Text style={styles.instructionText}>Upload a clear photo of the affected area</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={loading}>
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  uploadButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructionText: {
    color: "#333",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#A4AC86",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SkinDiseaseRecognition;