import {
    View,
    SafeAreaView,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
  } from 'react-native';
  import { useRef, useState, useEffect } from 'react';
  import Header from './Header';
  import Sidebar from './Sidebar';
  
  export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const sidebarAnim = useRef(new Animated.Value(260)).current;
  
    useEffect(() => {
      Animated.timing(slideAnim, {
        toValue: sidebarOpen ? -220 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
  
      Animated.timing(sidebarAnim, {
        toValue: sidebarOpen ? 0 : 220,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }, [sidebarOpen]);
  
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // adjust based on header height
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1 }}>
            {/* Main content that gets pushed */}
            <Animated.View
              style={{
                flex: 1,
                transform: [{ translateX: slideAnim }],
              }}
            >
              <View className="mt-2">
                <Header onOpenSidebar={() => setSidebarOpen(true)} />
              </View>
              {children}
            </Animated.View>
  
            {/* Sidebar overlays and animates from right */}
            <Animated.View
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 200,
                transform: [{ translateX: sidebarAnim }],
              }}
            >
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                slideAnim={slideAnim}
              />
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  