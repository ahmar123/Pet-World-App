import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {colors} from '../theme/colors'
import { MotiView } from 'moti'; // Import MotiView
// import PetClassifier from './PetClassifier'; // We will replace this with API call


const BreedIdentification = ({navigation, route}) => {
  const { userId } = route.params; // Get userId from route parameters
  const [selectedImage, setSelectedImage] = useState(null);
  // Remove classificationResult, predictedBreed, predictionConfidence, and loading states as they are related to API calls.
  // const [classificationResult, setClassificationResult] = useState(null);
  // const [predictedBreed, setPredictedBreed] = useState(null);
  // const [predictionConfidence, setPredictionConfidence] = useState(null);
  // Reintroduce state variables for API calls
  const [loading, setLoading] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null); // For Cat/Dog
  const [predictedBreed, setPredictedBreed] = useState(null); // For Dog Breed
  const [predictionConfidence, setPredictionConfidence] = useState(null); // For Dog Breed Confidence

  // Removed API_URL as API calls are being removed.
  // const API_URL = 'http://127.0.0.1:8000/predict_breed/'; 
  const FLASK_API_BASE_URL = 'http://10.211.0.23:5000'; // Your Flask API base URL

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        // Clear previous results (no longer applicable after API removal)
        // setClassificationResult(null); 
        // setPredictedBreed(null); 
        // setPredictionConfidence(null);

        // Clear previous results and trigger classification
        setClassificationResult(null);
        setPredictedBreed(null);
        setPredictionConfidence(null);
        classifyImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permission to use this feature');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        // Clear previous results (no longer applicable after API removal)
        // setClassificationResult(null); 
        // setPredictedBreed(null); 
        // setPredictionConfidence(null);

        // Clear previous results and trigger classification
        setClassificationResult(null);
        setPredictedBreed(null);
        setPredictionConfidence(null);
        classifyImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Removed classifyImage function as API calls are being removed.
  // const classifyImage = async () => {
  //   if (!selectedImage) {
  //     Alert.alert('No Image', 'Please select or take a photo first');
  //     return;
  //   }

  const classifyImage = async (imageUri) => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select or take a photo first');
      return;
    }

    setLoading(true);
    setClassificationResult(null); 
    setPredictedBreed(null); 
    setPredictionConfidence(null);

    const uri = imageUri;
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const formData = new FormData();
    formData.append('image', { // Changed from 'file' to 'image' to match Flask endpoint
      uri,
      name: filename,
      type,
    });

    try {
      // Step 1: Classify Cat vs Dog
      const catDogResponse = await fetch(`${FLASK_API_BASE_URL}/classify-cat-dog`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const catDogData = await catDogResponse.json();

      if (catDogResponse.ok) {
        const predictedAnimal = catDogData.predicted_label; // Dog or Cat
        const animalConfidence = (catDogData.confidence_score * 100).toFixed(2); // Confidence for Cat/Dog
        setClassificationResult(`${predictedAnimal} (Confidence: ${animalConfidence}%)`);

        if (predictedAnimal === 'Dog') {
          // Step 2: If it's a Dog, predict breed
          const breedResponse = await fetch(`${FLASK_API_BASE_URL}/predict-breed`, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const breedData = await breedResponse.json();

          if (breedResponse.ok) {
            setPredictedBreed(breedData.predicted_breed_label);
            // The Flask breed endpoint doesn't return a confidence score directly from the model, 
            // but if it did, you would set it here.
            // For now, we'll indicate it's from breed identification
            setPredictionConfidence(`Breed Confidence: N/A`); // Or adjust as per your Flask output
          } else {
            Alert.alert('Breed Prediction Failed', breedData.error || 'An error occurred during breed prediction.');
          }
        } else {
          // If it's a Cat, no breed prediction needed for this model
          setPredictedBreed('N/A (Not a Dog)');
          setPredictionConfidence('N/A');
        }
      } else {
        Alert.alert('Classification Failed', catDogData.error || 'An error occurred during cat/dog classification.');
      }
    } catch (error) {
      console.error('Network error or API not reachable:', error);
      Alert.alert('Error', 'Could not connect to the pet classification API. Please ensure it is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pet Breed Identification</Text>
        
        <View style={styles.imageSection}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, {backgroundColor: colors.primary}]} onPress={pickImage}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, {backgroundColor: 'white', borderWidth: 1, borderColor: colors.primary}]} onPress={takePhoto}>
            <Text style={[styles.buttonText, {color: colors.primary}]}>Take Photo</Text>
          </TouchableOpacity> 
        </View>

        {/* Removed classify button as API calls are being removed. */}
        {/* {selectedImage && (
          <TouchableOpacity 
            style={[styles.classifyButton, loading && styles.disabledButton]}
            onPress={classifyImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Identify Breed</Text>
            )}
          </TouchableOpacity>
        )} */}
        {selectedImage && (
          <TouchableOpacity 
            style={[styles.classifyButton, loading && styles.disabledButton]}
            onPress={() => classifyImage(selectedImage)} // Pass selectedImage URI
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Identify Pet and Breed</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Removed result container as API calls are being removed. */}
        {/* {(predictedBreed && predictionConfidence) && (
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            style={styles.resultContainer}
          >
            <Text style={styles.resultTitle}>Prediction Results:</Text>
            <Text style={styles.resultText}>
              Predicted Breed: {predictedBreed}
            </Text>
            <Text style={styles.resultText}>
              Confidence: {predictionConfidence}%
            </Text>
          </MotiView>
        )} */}
        {(classificationResult || predictedBreed) && ( // Show results if either is available
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            style={styles.resultContainer}
          >
            <Text style={styles.resultTitle}>Prediction Results:</Text>
            {/* {classificationResult && (
              <Text style={styles.resultText}>Classification: {classificationResult}</Text>
            )} */}
            {predictedBreed && (
              <Text style={styles.resultText}>Predicted Breed: {predictedBreed}</Text>
            )}
            {/* {predictionConfidence && (
              <Text style={styles.resultText}>Confidence: {predictionConfidence}</Text>
            )} */}
          </MotiView>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  placeholderImage: {
    width: 300,
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#D3C0A8',
    padding: 15,
    borderRadius: 8,
    width: '45%',
  },
  classifyButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
});

export default BreedIdentification; 