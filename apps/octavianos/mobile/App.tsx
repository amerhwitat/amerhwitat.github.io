import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

const APPS = [
  { icon: "📁", name: "Files", note: "Native file service is not connected." },
  { icon: "🌐", name: "Browser", note: "Browser launch is not connected." },
  { icon: "⌘", name: "Terminal", note: "Terminal requires the native command service." },
  { icon: "⚙️", name: "Settings", note: "System settings APIs are not connected." },
  { icon: "🧩", name: "App Library", note: "Signed package manifests are required." },
  { icon: "🌊", name: "Marine", note: "Marine is a separate desktop session." },
];

export default function App() {
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("OctavianOS mobile companion preview · not an ARM64 OS image.");
  const visible = useMemo(() => APPS.filter(a => (a.name + a.note).toLowerCase().includes(search.toLowerCase())), [search]);
  return <SafeAreaView style={styles.safe}>
    <ExpoStatusBar style="light" />
    <StatusBar barStyle="light-content" />
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}><Text style={styles.logo}>◈ OCTAVIANOS</Text><Text style={styles.subtitle}>MOBILE COMPANION</Text></View>
      <View style={styles.hero}><Text style={styles.orb}>🌊</Text><Text style={styles.title}>Oceanic{"\n"}computing.</Text><Text style={styles.copy}>A mobile companion UI for OctavianOS. This app does not contain or boot the Koronos ARM64 kernel.</Text></View>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search applications…" placeholderTextColor="#7fa4ba" style={styles.search} accessibilityLabel="Search applications" />
      <View style={styles.grid}>{visible.map(app => <TouchableOpacity key={app.name} accessibilityRole="button" style={styles.app} onPress={() => setNotice(app.note)}><Text style={styles.appIcon}>{app.icon}</Text><Text style={styles.appName}>{app.name}</Text></TouchableOpacity>)}</View>
      <View accessibilityLiveRegion="polite" style={styles.notice}><Text style={styles.noticeText}>{notice}</Text></View>
      <Text style={styles.footer}>Responsive companion · native service integration pending</Text>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#04152a" },
  page: { padding: 20, paddingBottom: 36, minHeight: "100%", backgroundColor: "#04152a" },
  header: { paddingTop: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#83e7ee30" },
  logo: { color: "#f0fcff", fontWeight: "800", letterSpacing: 3, fontSize: 15 },
  subtitle: { color: "#7ce4e9", fontSize: 9, letterSpacing: 2, marginTop: 7 },
  hero: { paddingVertical: 28 },
  orb: { fontSize: 54 },
  title: { color: "#f2fbff", fontSize: 42, fontWeight: "700", letterSpacing: -1.5, marginTop: 8 },
  copy: { color: "#b4cfe1", fontSize: 14, lineHeight: 21, marginTop: 12, maxWidth: 420 },
  search: { borderWidth: 1, borderColor: "#9beaf03b", borderRadius: 12, padding: 13, color: "#fff", backgroundColor: "#09253c", marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  app: { width: "31%", minWidth: 90, flexGrow: 1, minHeight: 105, borderRadius: 15, borderWidth: 1, borderColor: "#9beaf02b", backgroundColor: "#c9f9ff0b", padding: 13, justifyContent: "center" },
  appIcon: { fontSize: 28, marginBottom: 8 },
  appName: { color: "#f1fbff", fontSize: 12, fontWeight: "600" },
  notice: { marginTop: 20, padding: 14, borderRadius: 12, backgroundColor: "#0a2a43", borderWidth: 1, borderColor: "#9beaf02b" },
  noticeText: { color: "#9ee9f1", fontSize: 12, lineHeight: 18 },
  footer: { color: "#789ab2", fontSize: 10, marginTop: 18, textAlign: "center" },
});