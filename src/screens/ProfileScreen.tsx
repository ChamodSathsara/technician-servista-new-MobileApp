import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Field } from "../components/Ui";
import { colors, spacing } from "../theme";

type ProfileTab = "profile" | "about";
const contacts = [
  { name: "Chamod", number: "0766394432" },
  { name: "Gagan", number: "0772350108" },
];

export function ProfileScreen() {
  const { session, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const changePassword = async () => {
    if (next !== confirm) return Alert.alert("Passwords do not match");
    try {
      await api.changePassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      Alert.alert("Updated", "Password changed successfully.");
    } catch (error) {
      Alert.alert(
        "Could not change password",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  };

  const call = async (number: string) => {
    try {
      await Linking.openURL(`tel:${number}`);
    } catch {
      Alert.alert("Could not open the phone dialer", `Please call ${number}.`);
    }
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Text style={s.title}>Profile</Text>
      <View style={s.tabs}>
        <TabButton
          label="Profile"
          active={activeTab === "profile"}
          onPress={() => setActiveTab("profile")}
        />
        <TabButton
          label="About"
          active={activeTab === "about"}
          onPress={() => setActiveTab("about")}
        />
      </View>

      {activeTab === "profile" ? (
        <>
          <Card>
            <Text style={s.name}>{session?.userName}</Text>
            <Text style={s.meta}>{session?.email}</Text>
            <Text style={s.badge}>TECHNICIAN</Text>
          </Card>
          <Card>
            <Text style={s.section}>Change password</Text>
            <Field
              label="Current password"
              value={current}
              onChangeText={setCurrent}
              secureTextEntry
            />
            <Field
              label="New password"
              value={next}
              onChangeText={setNext}
              secureTextEntry
            />
            <Field
              label="Confirm new password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            <Button
              title="Update password"
              onPress={changePassword}
              disabled={!current || next.length < 8 || !confirm}
            />
          </Card>
        </>
      ) : (
        <>
          <Card>
            <Text style={s.section}>About Servista Mobile Application</Text>
            <Text style={s.aboutText}>
              Developed by Department of Gestetner Digital, Gestetner of Ceylon
              PLC.
            </Text>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Version</Text>
              <Text style={s.detailValue}>2.0</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Developer</Text>
              <Text style={s.detailValue}>Chamod Sathsara</Text>
            </View>
          </Card>
          <Card>
            <Text style={s.section}>Call us</Text>
            {contacts.map((contact) => (
              <Pressable
                key={contact.number}
                accessibilityRole="button"
                accessibilityLabel={`Call ${contact.name} on ${contact.number}`}
                onPress={() => call(contact.number)}
                style={({ pressed }) => [
                  s.contact,
                  pressed && s.contactPressed,
                ]}
              >
                <View>
                  <Text style={s.contactName}>{contact.name}</Text>
                  <Text style={s.contactNumber}>{contact.number}</Text>
                </View>
                <Text style={s.callAction}>Call</Text>
              </Pressable>
            ))}
          </Card>
        </>
      )}

      <Button title="Sign out" variant="outline" onPress={logout} />
    </ScrollView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[s.tab, active && s.activeTab]}
    >
      <Text style={[s.tabText, active && s.activeTabText]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#E4ECEA",
  },
  tab: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },
  activeTab: { backgroundColor: "#fff" },
  tabText: { fontSize: 15, fontWeight: "700", color: colors.muted },
  activeTabText: { color: colors.primary },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  meta: { color: colors.muted },
  badge: {
    alignSelf: "flex-start",
    color: colors.primary,
    fontWeight: "800",
    backgroundColor: "#E4F2F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  section: { fontSize: 18, fontWeight: "800", color: colors.text },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
  },
  detailLabel: { fontSize: 15, color: colors.muted },
  detailValue: { fontSize: 15, fontWeight: "700", color: colors.text },
  contact: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  contactPressed: { opacity: 0.7 },
  contactName: { fontSize: 16, fontWeight: "700", color: colors.text },
  contactNumber: { fontSize: 14, color: colors.muted, marginTop: 2 },
  callAction: { fontSize: 15, fontWeight: "800", color: colors.primary },
});
