import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const catBreedData = require("./breed.json");
const dogBreedData = require("./dog_breed_details.json");

function BreedDetails({ route }) {
  const { userId } = route.params;
  const navigation = useNavigation();

  const [userPets, setUserPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing!");
      setLoading(false);
      return;
    }

    async function fetchUserPets() {
      try {
        const url = `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!data) {
          setUserPets([]);
          setLoading(false);
          return;
        }

        const petsArray = Object.values(data);
        setUserPets(petsArray);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setUserPets([]);
        setLoading(false);
      }
    }

    fetchUserPets();
  }, [userId]);

  const formatContent = (content) => {
    if (!content) return "No information available.";
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.map((item) => `• ${item}`).join("\n");
    if (typeof content === "object") {
      return Object.entries(content)
        .map(([key, value]) => {
          if (value === undefined || value === null) {
            return `${capitalize(key)}: No information available.`;
          } else if (Array.isArray(value)) {
            const arrStr = value.map((i) => `    • ${i}`).join("\n");
            return `${capitalize(key)}:\n${arrStr}`;
          } else if (typeof value === "object") {
            const objStr = formatContent(value)
              .split("\n")
              .map((line) => "    " + line)
              .join("\n");
            return `${capitalize(key)}:\n${objStr}`;
          } else {
            return `${capitalize(key)}: ${value}`;
          }
        })
        .join("\n");
    }
    return String(content);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).replace(/\_/g, " ");

  const openModal = (title, content) => {
    const formatted = formatContent(content);
    setModalTitle(title);
    setModalContent(formatted);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalContent("");
    setModalTitle("");
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Loading pets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );
  }

  if (!userPets || userPets.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No pets found for this user.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {userPets.map((pet, index) => {
          // Try both cat and dog breeds
          const breedInfo = (catBreedData.cat_breeds && catBreedData.cat_breeds.find((breed) => breed.name === pet.breed)) ||
                            (dogBreedData.dog_breeds && dogBreedData.dog_breeds.find((breed) => breed.name === pet.breed));
          return (
            <View
              key={index}
              style={styles.petCard}
            >
              <Text style={styles.petName}>
                {pet.petName} ({pet.gender})
              </Text>
              <Image source={{ uri: pet.image }} style={styles.petImage} />
              <Text>Age: {pet.age}</Text>
              <Text>Breed: {pet.breed}</Text>
              <Text>
                Weight: {pet.weight} {pet.unit}
              </Text>
              <Text>Description: {pet.petDescription}</Text>

              {breedInfo ? (
                <View style={styles.buttonContainer}>
                  {breedInfo.basic_information && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Basic Information", breedInfo.basic_information)}
                    >
                      <Text>Basic Info</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.physical_characteristics && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Physical Characteristics", breedInfo.physical_characteristics)}
                    >
                      <Text>Physical</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.personality_and_behavior && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Personality and Behavior", breedInfo.personality_and_behavior)}
                    >
                      <Text>Personality</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.social_compatibility && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Social Compatibility", breedInfo.social_compatibility)}
                    >
                      <Text>Social</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.health_profile && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Health Profile", breedInfo.health_profile)}
                    >
                      <Text>Health</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.grooming_and_maintenance && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Grooming and Maintenance", breedInfo.grooming_and_maintenance)}
                    >
                      <Text>Grooming</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.environmental_needs && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Environmental Needs", breedInfo.environmental_needs)}
                    >
                      <Text>Environment</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.training_and_mental_stimulation && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Training and Mental Stimulation", breedInfo.training_and_mental_stimulation)}
                    >
                      <Text>Training</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.potential_challenges && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Potential Challenges", breedInfo.potential_challenges)}
                    >
                      <Text>Challenges</Text>
                    </TouchableOpacity>
                  )}
                  {breedInfo.sleep_patterns_and_habits && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => openModal("Sleep Patterns and Habits", breedInfo.sleep_patterns_and_habits)}
                    >
                      <Text>Sleep</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <Text style={{ fontStyle: "italic" }}>
                  No breed information available for this breed.
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Modal for Breed Info */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text>{modalContent}</Text>
              <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={closeModal}>
                <Text>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Ask AI Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Chatbot", { userId })}
      >
        <Text style={styles.fabText}>Ask AI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  petCard: {
    marginBottom: 25,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  petImage: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    maxHeight: "80%",
    width: "85%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default BreedDetails;
