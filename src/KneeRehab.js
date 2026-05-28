import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { phases, UNLOCK_CRITERIA } from "./phases";

const STORAGE_KEY = "@knee-rehab/checked";

const mono = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

function tint(hex, alphaHex = "11") {
  return `${hex}${alphaHex}`;
}

export default function KneeRehab() {
  const insets = useSafeAreaInsets();
  const [activePhase, setActivePhase] = useState(0);
  const [checkedExercises, setCheckedExercises] = useState({});
  const [expandedEx, setExpandedEx] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const phase = phases[activePhase];

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setCheckedExercises(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checkedExercises)).catch(
      () => {}
    );
  }, [checkedExercises, hydrated]);

  const toggleCheck = useCallback((key) => {
    setCheckedExercises((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleExpand = useCallback((key) => {
    setExpandedEx((prev) => (prev === key ? null : key));
  }, []);

  const completedCount = phase.exercises.filter(
    (_, i) => checkedExercises[`${phase.id}-${i}`]
  ).length;

  const progressPct = (completedCount / phase.exercises.length) * 100;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Knee Rehabilitation Protocol</Text>
          <Text style={styles.title}>
            Post Meniscectomy{"\n"}
            <Text style={{ color: phase.color }}>Recovery Plan</Text>
          </Text>
          <Text style={styles.subtitle}>
            Partial meniscectomy (flap removal) · Aggresive Athlete Recovery Pacing
          </Text>
        </View>

        {/* Phase tabs — sticky */}
        <View style={styles.tabBar}>
          {phases.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => {
                setActivePhase(i);
                setExpandedEx(null);
              }}
              style={[
                styles.tab,
                activePhase === i && {
                  borderBottomColor: p.color,
                  borderBottomWidth: 3,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: activePhase === i ? p.color : "#444" },
                ]}
              >
                {p.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Phase header card */}
        <View
          style={[
            styles.phaseCard,
            { borderLeftColor: phase.color },
          ]}
        >
          <View style={styles.phaseCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.phaseSubtitle, { color: phase.color }]}>
                {phase.subtitle}
              </Text>
              <Text style={styles.phaseWeeks}>{phase.weeks}</Text>
            </View>
            <View style={styles.doneBadge}>
              <Text
                style={{
                  fontSize: 12,
                  color:
                    completedCount === phase.exercises.length
                      ? phase.color
                      : "#555",
                  fontFamily: mono,
                }}
              >
                {completedCount}/{phase.exercises.length} done
              </Text>
            </View>
          </View>

          <Text style={styles.goalText}>
            <Text style={styles.goalLabel}>Goal: </Text>
            {phase.goal}
          </Text>

          <View
            style={[
              styles.noteBox,
              { backgroundColor: tint(phase.color) },
            ]}
          >
            <Text style={[styles.noteText, { color: phase.color }]}>
              ⚡ {phase.note}
            </Text>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.exerciseList}>
          {phase.exercises.map((ex, i) => {
            const key = `${phase.id}-${i}`;
            const isChecked = !!checkedExercises[key];
            const isExpanded = expandedEx === key;

            return (
              <View
                key={key}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: isChecked ? "#0f1f1a" : "#111",
                    borderColor: isChecked ? `${phase.accent}44` : "#1e1e1e",
                  },
                ]}
              >
                <View style={styles.exerciseRow}>
                  <Pressable
                    onPress={() => toggleCheck(key)}
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isChecked ? phase.color : "#333",
                        backgroundColor: isChecked ? phase.color : "transparent",
                      },
                    ]}
                    hitSlop={8}
                  >
                    {isChecked && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>

                  <Pressable
                    style={styles.exerciseBody}
                    onPress={() => toggleExpand(key)}
                  >
                    <Text
                      style={[
                        styles.exerciseName,
                        isChecked && styles.exerciseNameDone,
                      ]}
                    >
                      {ex.name}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                      {ex.sets} · Rest {ex.rest}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => toggleExpand(key)}
                    hitSlop={12}
                    style={styles.chevronWrap}
                  >
                    <Text
                      style={[
                        styles.chevron,
                        {
                          transform: [
                            { rotate: isExpanded ? "180deg" : "0deg" },
                          ],
                        },
                      ]}
                    >
                      ↓
                    </Text>
                  </Pressable>
                </View>

                {isExpanded && (
                  <View style={styles.expanded}>
                    <Text style={styles.desc}>{ex.desc}</Text>
                    <View
                      style={[
                        styles.cueBox,
                        {
                          backgroundColor: tint(phase.color, "0D"),
                          borderLeftColor: phase.color,
                        },
                      ]}
                    >
                      <Text style={[styles.cueText, { color: phase.color }]}>
                        💡 {ex.cue}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Session Progress</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: phase.color,
                },
              ]}
            />
          </View>
          {completedCount === phase.exercises.length && (
            <Text style={[styles.completeBanner, { color: phase.color }]}>
              SESSION COMPLETE ✓
            </Text>
          )}
        </View>

        {/* Unlock guide */}
        {activePhase < 2 && UNLOCK_CRITERIA[activePhase] && (
          <View style={styles.unlockCard}>
            <Text style={styles.unlockTitle}>
              To unlock {phases[activePhase + 1].name}
            </Text>
            {UNLOCK_CRITERIA[activePhase].map((item) => (
              <Text key={item} style={styles.unlockItem}>
                ✓ {item}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 4,
    color: "#555",
    marginBottom: 8,
    textTransform: "uppercase",
    fontFamily: mono,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 30,
    color: "#E8E4DC",
    fontFamily: mono,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 10,
    fontFamily: mono,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0D0D0D",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: mono,
  },
  phaseCard: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: "#111",
    borderLeftWidth: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  phaseCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  phaseSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: mono,
  },
  phaseWeeks: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    letterSpacing: 2,
    fontFamily: mono,
  },
  doneBadge: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  goalText: {
    fontSize: 13,
    color: "#999",
    marginTop: 14,
    lineHeight: 21,
    fontFamily: mono,
  },
  goalLabel: {
    color: "#ccc",
    fontWeight: "700",
  },
  noteBox: {
    marginTop: 10,
    marginBottom: 16,
    padding: 10,
    borderRadius: 6,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: mono,
  },
  exerciseList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  exerciseCard: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 13,
    color: "#0D0D0D",
    fontWeight: "700",
  },
  exerciseBody: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DDD",
    fontFamily: mono,
  },
  exerciseNameDone: {
    color: "#555",
    textDecorationLine: "line-through",
  },
  exerciseMeta: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
    letterSpacing: 1,
    fontFamily: mono,
  },
  chevronWrap: {
    padding: 4,
  },
  chevron: {
    color: "#444",
    fontSize: 18,
    fontFamily: mono,
  },
  expanded: {
    paddingLeft: 52,
    paddingRight: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  desc: {
    fontSize: 13,
    color: "#999",
    lineHeight: 22,
    marginTop: 12,
    fontFamily: mono,
  },
  cueBox: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  cueText: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: mono,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressLabel: {
    fontSize: 11,
    color: "#444",
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: "uppercase",
    fontFamily: mono,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#1a1a1a",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  completeBanner: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: mono,
  },
  unlockCard: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: "#111",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  unlockTitle: {
    fontSize: 11,
    color: "#444",
    letterSpacing: 3,
    marginBottom: 8,
    textTransform: "uppercase",
    fontFamily: mono,
  },
  unlockItem: {
    fontSize: 13,
    color: "#777",
    lineHeight: 23,
    fontFamily: mono,
  },
});
