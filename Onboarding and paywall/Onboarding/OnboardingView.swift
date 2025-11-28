import SwiftUI

// MARK: - Main View
struct OnboardingView: View {
    @State private var currentTab = 0
    @State private var navButtonText = "Get Started"
    @State private var showSkipButton = false
    @State private var hideNavContainer = false
    
    // Shared State for Animations
    @State private var triggerScan = false
    @State private var triggerTryOn = false
    @State private var tryOnCompleted = false
    
    var body: some View {
        ZStack {
            Color(hex: "F0F0F0").ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Custom TabView for Slides
                TabView(selection: $currentTab) {
                    WelcomeSlide()
                        .tag(0)
                    
                    AnalysisSlide(triggerAnimation: triggerScan)
                        .tag(1)
                    
                    TryOnSlide(triggerAnimation: triggerTryOn)
                        .tag(2)
                    
                    StylistSlide()
                        .tag(3)
                    
                    UserInfoSlide()
                        .tag(4)
                    
                    PaywallSlide()
                        .tag(5)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut(duration: 0.6), value: currentTab)
                
                // Bottom Navigation Area
                if !hideNavContainer {
                    VStack(spacing: 12) {
                        Button(action: handleMainAction) {
                            Text(navButtonText)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color(hex: "0A0A0A"))
                                .cornerRadius(16)
                                .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 10)
                        }
                        .padding(.horizontal, 24)
                        
                        if showSkipButton {
                            Button("I prefer not to share my details") {
                                withAnimation {
                                    currentTab += 1
                                    updateNavState()
                                }
                            }
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(hex: "505050"))
                            .underline()
                        }
                    }
                    .padding(.bottom, 24)
                    .padding(.top, 10)
                    .background(Color(hex: "F0F0F0")) // Blend with bg
                }
            }
        }
        .onChange(of: currentTab) { _, newValue in
            updateNavState()
            if newValue == 1 { triggerScan = true }
        }
    }
    
    func handleMainAction() {
        if currentTab == 2 {
            if !tryOnCompleted {
                triggerTryOn = true
                navButtonText = "Visualize..."
                
                // Simulate processing delay
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    navButtonText = "Continue"
                    tryOnCompleted = true
                }
                return
            }
        }
        
        if currentTab < 5 {
            withAnimation {
                currentTab += 1
            }
        }
    }
    
    func updateNavState() {
        // Skip Button Logic
        showSkipButton = (currentTab == 4)
        
        // Nav Container Visibility
        if currentTab == 5 {
            withAnimation { hideNavContainer = true }
        } else {
            hideNavContainer = false
        }
        
        // Button Text Logic
        if currentTab == 0 {
            navButtonText = "Get Started"
        } else if currentTab == 2 {
            navButtonText = tryOnCompleted ? "Continue" : "Visualize"
        } else {
            navButtonText = "Continue"
        }
    }
}

// MARK: - Slide 1: Welcome (Holo Animation)
struct WelcomeSlide: View {
    @State private var isAnimating = false
    
    var body: some View {
        VStack {
            Spacer()
            
            // Holo Container
            ZStack {
                // Ring 1
                Circle()
                    .strokeBorder(Color(hex: "7900FF"), lineWidth: 1)
                    .overlay(
                        Circle()
                            .stroke(Color(hex: "7900FF"), style: StrokeStyle(lineWidth: 2, lineCap: .round, dash: [100, 400]))
                    )
                    .frame(width: 260, height: 260)
                    .rotationEffect(.degrees(isAnimating ? 360 : 0))
                    .animation(.linear(duration: 10).repeatForever(autoreverses: false), value: isAnimating)
                
                // Ring 2
                Circle()
                    .stroke(style: StrokeStyle(lineWidth: 2, dash: [10, 10]))
                    .foregroundColor(Color(hex: "00BFFF"))
                    .frame(width: 182, height: 182) // 70%
                    .opacity(0.5)
                    .rotationEffect(.degrees(isAnimating ? -360 : 0))
                    .animation(.linear(duration: 15).repeatForever(autoreverses: false), value: isAnimating)
                
                // Ring 3
                Circle()
                    .stroke(Color.black.opacity(0.05), lineWidth: 1)
                    .overlay(
                        Circle()
                            .trim(from: 0, to: 0.2)
                            .stroke(Color(hex: "0A0A0A"), lineWidth: 4)
                            .rotationEffect(.degrees(-90))
                    )
                    .frame(width: 338, height: 338) // 130%
                    .opacity(0.1)
                    .rotationEffect(.degrees(isAnimating ? 360 : 0))
                    .animation(.linear(duration: 20).repeatForever(autoreverses: false), value: isAnimating)
                
                // Central Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 24)
                        .fill(Color.clear)
                        .frame(width: 90, height: 90)
                        .shadow(color: Color.black.opacity(0.2), radius: 20, x: 0, y: 20)
                    
                    Image("Icon-iOS-Default-1024x1024@1x.png") // Asset Name
                        .resizable()
                        .aspectRatio(contentMode: .cover)
                        .frame(width: 90, height: 90)
                        .cornerRadius(24)
                }
                .offset(y: isAnimating ? -10 : 0)
                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: isAnimating)
                
                // Orbiting Items
                OrbitItem(emoji: "👕", delay: 0, isAnimating: isAnimating)
                OrbitItem(emoji: "👖", delay: -2.66, isAnimating: isAnimating)
                OrbitItem(emoji: "👟", delay: -5.33, isAnimating: isAnimating)
            }
            .padding(.bottom, 48)
            
            // Text
            Text("Your Style")
                .font(.system(size: 36, weight: .black))
                .foregroundColor(Color(hex: "0A0A0A"))
                + Text("\n")
                + Text("Perfected.")
                .font(.system(size: 36, weight: .black))
                .foregroundStyle(LinearGradient(colors: [Color(hex: "7900FF"), Color(hex: "00BFFF")], startPoint: .leading, endPoint: .trailing))
            
            Text("The ultimate digital wardrobe experience.")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(Color(hex: "505050"))
                .multilineTextAlignment(.center)
                .padding(.top, 20)
            
            Text("Digitize. Organize. Inspire.")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(Color(hex: "0A0A0A"))
                .padding(.top, 4)
            
            Spacer()
        }
        .padding(.horizontal, 24)
        .onAppear { isAnimating = true }
    }
}

struct OrbitItem: View {
    let emoji: String
    let delay: Double
    let isAnimating: Bool
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white)
                .frame(width: 40, height: 40)
                .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 8)
            Text(emoji).font(.system(size: 20))
        }
        .rotationEffect(.degrees(isAnimating ? 360 : 0))
        .offset(x: 100) // Orbit radius
        .rotationEffect(.degrees(isAnimating ? 360 : 0)) // Counter rotation to keep upright if needed, or just orbit
        // Note: The CSS implementation rotates the container, then translates, then rotates back.
        // Simplified SwiftUI orbit:
        .rotationEffect(.degrees(isAnimating ? 360 : 0))
        .animation(.linear(duration: 8).repeatForever(autoreverses: false).delay(delay), value: isAnimating)
    }
}

// MARK: - Slide 2: Analysis
struct AnalysisSlide: View {
    var triggerAnimation: Bool
    @State private var showClean = false
    @State private var showInfo = false
    @State private var scanLineOffset: CGFloat = -150
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack {
                Text("Smart Analysis")
                    .font(.system(size: 24, weight: .black))
                    .foregroundColor(Color(hex: "0A0A0A"))
                    .padding(.top, 40)
                    .padding(.bottom, 24)
                
                // Image Card
                ZStack(alignment: .top) {
                    // Messy Image
                    Image("unnamed (1).jpg")
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(height: 256)
                        .clipped()
                        .opacity(showClean ? 0 : 1)
                    
                    // Clean Image
                    ZStack {
                        Color.white
                        Image("5Gy2pbqhJyG6F_QCa9Lv9.png")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .padding(24)
                            .shadow(radius: 10)
                    }
                    .frame(height: 256)
                    .opacity(showClean ? 1 : 0)
                    
                    // Scan Line
                    Rectangle()
                        .fill(Color(hex: "7900FF"))
                        .frame(height: 3)
                        .shadow(color: Color(hex: "7900FF"), radius: 15)
                        .offset(y: scanLineOffset)
                        .opacity(triggerAnimation ? (scanLineOffset > 256 ? 0 : 1) : 0)
                }
                .frame(height: 256)
                .cornerRadius(24)
                .shadow(color: Color.black.opacity(0.1), radius: 10)
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
                .padding(.bottom, 12)
                
                // Info Card
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("ANALYSIS COMPLETE")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(hex: "7900FF"))
                        Spacer()
                        HStack(spacing: 4) {
                            TagView(text: "Top")
                            TagView(text: "Cotton")
                        }
                    }
                    .padding(.bottom, 4)
                    .overlay(Rectangle().frame(height: 1).foregroundColor(Color.gray.opacity(0.1)), alignment: .bottom)
                    
                    Text("White Graphic T-Shirt")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(hex: "0A0A0A"))
                    
                    Text("A white, short-sleeved t-shirt with a graphic print. Features a colorful abstract design with shapes in blue, red, and yellow.")
                        .font(.system(size: 11))
                        .foregroundColor(Color(hex: "505050"))
                        .lineLimit(3)
                }
                .padding(12)
                .background(Color.white)
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 2)
                .opacity(showInfo ? 1 : 0)
                .offset(y: showInfo ? 0 : 20)
                
                // Stats Card
                HStack(spacing: 16) {
                    // Simple Pie Chart View
                    ZStack {
                        Circle().trim(from: 0, to: 0.4).stroke(Color(hex: "7900FF"), lineWidth: 15).rotationEffect(.degrees(-90))
                        Circle().trim(from: 0.4, to: 0.65).stroke(Color(hex: "00BFFF"), lineWidth: 15).rotationEffect(.degrees(-90))
                        Circle().trim(from: 0.65, to: 0.8).stroke(Color(hex: "005F73"), lineWidth: 15).rotationEffect(.degrees(-90))
                        Circle().trim(from: 0.8, to: 1.0).stroke(Color(hex: "505050"), lineWidth: 15).rotationEffect(.degrees(-90))
                    }
                    .frame(width: 60, height: 60)
                    
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                        StatItem(color: "7900FF", label: "T-Shirts", value: "40%")
                        StatItem(color: "00BFFF", label: "Jeans", value: "25%")
                        StatItem(color: "005F73", label: "Jackets", value: "15%")
                        StatItem(color: "505050", label: "Shoes", value: "20%")
                    }
                }
                .padding(12)
                .background(Color.white)
                .cornerRadius(24)
                .shadow(color: Color.black.opacity(0.1), radius: 10)
                .opacity(showInfo ? 1 : 0)
                .offset(y: showInfo ? 0 : 20)
                .padding(.top, 12)
            }
            .padding(.horizontal, 24)
        }
        .onChange(of: triggerAnimation) { _, newValue in
            if newValue {
                withAnimation(.linear(duration: 2.5)) {
                    scanLineOffset = 260
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    withAnimation { showClean = true }
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                    withAnimation { showInfo = true }
                }
            }
        }
    }
}

struct TagView: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(Color(hex: "505050"))
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(99)
    }
}

struct StatItem: View {
    let color: String
    let label: String
    let value: String
    var body: some View {
        VStack(alignment: .leading) {
            HStack(spacing: 4) {
                Circle().fill(Color(hex: color)).frame(width: 8, height: 8)
                Text(label).font(.system(size: 10, weight: .bold)).foregroundColor(Color(hex: "505050"))
            }
            Text(value).font(.system(size: 12, weight: .black)).foregroundColor(Color(hex: "0A0A0A")).padding(.leading, 12)
        }
    }
}

// MARK: - Slide 3: Virtual Try-On
struct TryOnSlide: View {
    var triggerAnimation: Bool
    @State private var showResult = false
    @State private var showFlash = false
    @State private var clothOffset: CGSize = .zero
    @State private var clothScale: CGFloat = 1.0
    @State private var clothOpacity: Double = 1.0
    
    var body: some View {
        VStack {
            Text("Virtual Try-On")
                .font(.system(size: 24, weight: .black))
                .foregroundColor(Color(hex: "0A0A0A"))
                .padding(.top, 40)
                .padding(.bottom, 24)
            
            ZStack {
                // Container
                RoundedRectangle(cornerRadius: 32)
                    .fill(Color.gray.opacity(0.2))
                    .overlay(RoundedRectangle(cornerRadius: 32).stroke(Color.white, lineWidth: 4))
                    .shadow(radius: 10)
                
                // User Base
                Image("Gemini_Generated_Image_nrn7p6nrn7p6nrn7.png")
                    .resizable()
                    .aspectRatio(contentMode: .cover)
                    .cornerRadius(32)
                
                // Result
                Image("Gemini_Generated_Image_i60zxhi60zxhi60z.png")
                    .resizable()
                    .aspectRatio(contentMode: .cover)
                    .cornerRadius(32)
                    .opacity(showResult ? 1 : 0)
                
                // Result Badge
                if showResult {
                    VStack {
                        Spacer()
                        HStack {
                            Text("✨ Generated Look")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(Color(hex: "7900FF"))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 4)
                        .background(Color.white.opacity(0.9))
                        .cornerRadius(20)
                        .padding(.bottom, 16)
                    }
                    .transition(.opacity)
                }
                
                // Flash Overlay
                Color.white
                    .opacity(showFlash ? 0.8 : 0)
                    .cornerRadius(32)
                
                // Floating Cloth
                GeometryReader { geo in
                    Image("5Gy2pbqhJyG6F_QCa9Lv9.png")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .padding(8)
                        .background(Color.white)
                        .cornerRadius(12)
                        .shadow(radius: 5)
                        .frame(width: 100, height: 120)
                        .rotationEffect(.degrees(6))
                        .position(x: geo.size.width - 60, y: geo.size.height - 70) // Bottom Right
                        .offset(clothOffset)
                        .scaleEffect(clothScale)
                        .opacity(clothOpacity)
                }
            }
            .frame(height: 450) // Approx 65% of screen
            .padding(.horizontal, 24)
            
            Text("Tap \"Visualize\" to see the magic.")
                .font(.system(size: 14))
                .foregroundColor(Color(hex: "505050"))
                .padding(.top, 32)
            
            Spacer()
        }
        .onChange(of: triggerAnimation) { _, newValue in
            if newValue {
                // Animate Cloth to Center
                withAnimation(.easeInOut(duration: 0.6)) {
                    clothOffset = CGSize(width: -120, height: -180) // Approximate move to center
                    clothScale = 2.0
                    clothOpacity = 0
                }
                
                // Flash
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                    withAnimation(.easeOut(duration: 0.3)) { showFlash = true }
                    withAnimation(.easeIn(duration: 0.3).delay(0.3)) { showFlash = false }
                }
                
                // Show Result
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
                    withAnimation { showResult = true }
                }
            }
        }
    }
}

// MARK: - Slide 4: AI Stylist
struct StylistSlide: View {
    var body: some View {
        VStack {
            Text("AI Stylist")
                .font(.system(size: 24, weight: .black))
                .foregroundColor(Color(hex: "0A0A0A"))
                .padding(.top, 40)
                .padding(.bottom, 24)
            
            // Request Card
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Circle().fill(Color.gray.opacity(0.1)).frame(width: 24, height: 24)
                        .overlay(Text("👤").font(.system(size: 10)))
                    Text("YOUR REQUEST")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(hex: "7900FF"))
                }
                Text("\"I have a coffee date today. It's chilly outside. Create a cozy, casual outfit.\"")
                    .font(.system(size: 14, weight: .medium))
                    .italic()
                    .foregroundColor(Color(hex: "0A0A0A"))
            }
            .padding(20)
            .background(Color.white)
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.05), radius: 2)
            .padding(.horizontal, 24)
            .padding(.bottom, 16)
            
            // Result Card
            VStack {
                HStack(spacing: 8) {
                    StylistImage(image: "Gemini_Generated_Image_qbq8cqqbq8cqqbq8.jpg", label: "Suggestion 1")
                    StylistImage(image: "Gemini_Generated_Image_qbq8cqqbq8cqqbq8.png", label: "Suggestion 2")
                }
                .frame(height: 200)
                .padding(.bottom, 12)
                
                HStack(alignment: .top, spacing: 8) {
                    Text("🎨").font(.title3)
                    VStack(alignment: .leading) {
                        Text("Stylist Note")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(hex: "0A0A0A"))
                        Text("Try this layered look with a warm jacket and a comfortable top. It's stylish yet cozy enough for your coffee date.")
                            .font(.system(size: 12))
                            .foregroundColor(Color(hex: "505050"))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(12)
                .background(Color(hex: "F9FAFB"))
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.1)))
            }
            .padding(20)
            .background(Color.white)
            .cornerRadius(24)
            .shadow(color: Color(hex: "7900FF").opacity(0.2), radius: 10)
            .padding(.horizontal, 24)
            
            Spacer()
        }
    }
}

struct StylistImage: View {
    let image: String
    let label: String
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .bottomLeading) {
                Image(image)
                    .resizable()
                    .aspectRatio(contentMode: .cover)
                    .frame(width: geo.size.width, height: geo.size.height)
                
                Text(label)
                    .font(.system(size: 8))
                    .foregroundColor(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.black.opacity(0.5))
                    .cornerRadius(4)
                    .padding(4)
            }
        }
        .cornerRadius(12)
        .background(Color.gray.opacity(0.1))
    }
}

// MARK: - Slide 5: User Info
struct UserInfoSlide: View {
    @State private var gender = "Female"
    @State private var age: Double = 24
    @State private var height: Double = 170
    @State private var weight: Double = 60
    
    var body: some View {
        ScrollView {
            VStack {
                Text("About You")
                    .font(.system(size: 24, weight: .black))
                    .foregroundColor(Color(hex: "0A0A0A"))
                    .padding(.top, 40)
                
                Text("Help us tailor the perfect fit.")
                    .font(.system(size: 14))
                    .foregroundColor(Color(hex: "505050"))
                    .padding(.bottom, 24)
                
                // Gender
                VStack(alignment: .leading) {
                    Text("GENDER")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(hex: "0A0A0A"))
                    
                    HStack(spacing: 12) {
                        GenderButton(title: "Female", selected: gender == "Female") { gender = "Female" }
                        GenderButton(title: "Male", selected: gender == "Male") { gender = "Male" }
                        GenderButton(title: "Other", selected: gender == "Other") { gender = "Other" }
                    }
                }
                .padding(.bottom, 24)
                
                // Age
                VStack(alignment: .leading) {
                    HStack {
                        Text("AGE")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(hex: "0A0A0A"))
                        Spacer()
                        Text("\(Int(age))")
                            .font(.system(size: 20, weight: .black))
                            .foregroundColor(Color(hex: "7900FF"))
                    }
                    Slider(value: $age, in: 13...80, step: 1)
                        .tint(Color(hex: "7900FF"))
                }
                .padding(.bottom, 24)
                
                // Height
                VStack(alignment: .leading) {
                    Text("HEIGHT")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(hex: "0A0A0A"))
                    
                    VStack {
                        Text("\(Int(height)) cm")
                            .font(.system(size: 30, weight: .black))
                            .foregroundColor(Color(hex: "0A0A0A"))
                        + Text(" / \(formatHeight(height))")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(Color.gray.opacity(0.6))
                        
                        Slider(value: $height, in: 100...250, step: 1)
                            .tint(Color(hex: "7900FF"))
                    }
                    .padding(16)
                    .background(Color.white)
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.05), radius: 2)
                }
                .padding(.bottom, 24)
                
                // Weight
                VStack(alignment: .leading) {
                    Text("WEIGHT")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(hex: "0A0A0A"))
                    
                    VStack {
                        Text("\(Int(weight)) kg")
                            .font(.system(size: 30, weight: .black))
                            .foregroundColor(Color(hex: "0A0A0A"))
                        + Text(" / \(Int(weight * 2.20462)) lbs")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(Color.gray.opacity(0.6))
                        
                        Slider(value: $weight, in: 30...200, step: 1)
                            .tint(Color(hex: "7900FF"))
                    }
                    .padding(16)
                    .background(Color.white)
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.05), radius: 2)
                }
                
                Spacer().frame(height: 100)
            }
            .padding(.horizontal, 24)
        }
    }
    
    func formatHeight(_ cm: Double) -> String {
        let totalInches = cm / 2.54
        let ft = Int(totalInches / 12)
        let inch = Int(totalInches.truncatingRemainder(dividingBy: 12))
        return "\(ft)'\(inch)\""
    }
}

struct GenderButton: View {
    let title: String
    let selected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(selected ? Color(hex: "F5F3FF") : Color.white)
                .foregroundColor(selected ? Color(hex: "7900FF") : Color(hex: "505050"))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(selected ? Color(hex: "7900FF") : Color(hex: "E5E7EB"), lineWidth: 1)
                )
        }
    }
}

// MARK: - Slide 6: Paywall
struct PaywallSlide: View {
    @State private var billing = "monthly" // monthly, yearly
    @State private var tier = "pro" // freemium, basic, pro
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: 4) {
                Text("Unlock Your Potential")
                    .font(.system(size: 24, weight: .black))
                    .foregroundColor(Color(hex: "0A0A0A"))
                Text("Compare plans & find your perfect fit.")
                    .font(.system(size: 14))
                    .foregroundColor(Color(hex: "505050"))
            }
            .padding(.top, 48)
            .padding(.bottom, 16)
            
            // Billing Toggle
            HStack(spacing: 0) {
                Button(action: { billing = "monthly" }) {
                    Text("Monthly")
                        .font(.system(size: 12, weight: .bold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(billing == "monthly" ? Color.white : Color.clear)
                        .foregroundColor(billing == "monthly" ? Color(hex: "7900FF") : Color(hex: "505050"))
                        .cornerRadius(99)
                        .shadow(color: billing == "monthly" ? Color.black.opacity(0.1) : .clear, radius: 2)
                }
                
                Button(action: { billing = "yearly" }) {
                    ZStack {
                        Text("Yearly")
                            .font(.system(size: 12, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(billing == "yearly" ? Color.white : Color.clear)
                            .foregroundColor(billing == "yearly" ? Color(hex: "7900FF") : Color(hex: "505050"))
                            .cornerRadius(99)
                            .shadow(color: billing == "yearly" ? Color.black.opacity(0.1) : .clear, radius: 2)
                        
                        // Save Badge
                        Text("SAVE 25%")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(hex: "00BFFF"))
                            .cornerRadius(99)
                            .offset(x: 30, y: -12)
                    }
                }
            }
            .padding(4)
            .background(Color(hex: "E0E0E0"))
            .cornerRadius(99)
            .frame(width: 280)
            .padding(.bottom, 16)
            
            // Tier Tabs
            HStack(spacing: 8) {
                TierTab(title: "Free", isSelected: tier == "freemium") { tier = "freemium" }
                TierTab(title: "Basic", isSelected: tier == "basic") { tier = "basic" }
                
                // Pro Tab with Badge
                Button(action: { tier = "pro" }) {
                    ZStack {
                        Text("Pro")
                            .font(.system(size: 12, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(tier == "pro" ? Color(hex: "7900FF") : Color.white)
                            .foregroundColor(tier == "pro" ? .white : Color(hex: "505050"))
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(tier == "pro" ? Color.clear : Color(hex: "E0E0E0")))
                            .shadow(color: tier == "pro" ? Color(hex: "7900FF").opacity(0.3) : .clear, radius: 8, y: 4)
                        
                        Text("MOST POPULAR")
                            .font(.system(size: 7, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color(hex: "00BFFF")) // Updated Blue
                            .cornerRadius(99)
                            .overlay(RoundedRectangle(cornerRadius: 99).stroke(Color(hex: "F0F0F0"), lineWidth: 2))
                            .offset(y: -18)
                            .shadow(color: Color(hex: "00BFFF").opacity(0.2), radius: 4) // Updated Shadow
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 12)
            
            // Main Card
            VStack {
                // Glow Effect
                Circle()
                    .fill(Color(hex: "C8A2C8").opacity(0.4))
                    .frame(width: 200, height: 200)
                    .blur(radius: 60)
                    .offset(x: 100, y: -100)
                
                VStack(spacing: 20) {
                    // Price Header
                    VStack {
                        Text(tierName)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color(hex: "505050"))
                            .textCase(.uppercase)
                            .tracking(2)
                        
                        HStack(alignment: .bottom, spacing: 2) {
                            Text(tierPrice)
                                .font(.system(size: 36, weight: .black))
                                .foregroundColor(Color(hex: "0A0A0A"))
                            Text(tierPeriod)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(Color(hex: "505050"))
                                .padding(.bottom, 6)
                        }
                    }
                    
                    // Features List
                    VStack(spacing: 20) {
                        FeatureRow(icon: "🚫", color: .red, title: "Ad-Free Experience", value: adsText, isBadge: true, badgeColor: adsColor)
                        FeatureRow(icon: "👚", color: Color(hex: "7900FF"), title: "Wardrobe Limit", value: wardrobeText, progress: wardrobeProgress, progressColor: Color(hex: "7900FF"))
                        FeatureRow(icon: "🪄", color: Color(hex: "00BFFF"), title: "Virtual Try-On", value: tryonText, progress: tryonProgress, progressColor: Color(hex: "00BFFF"))
                        FeatureRow(icon: "🔍", color: Color(hex: "5A00CC"), title: "Clothing Analysis", value: analysisText, progress: analysisProgress, progressColor: Color(hex: "5A00CC"))
                        FeatureRow(icon: "✨", color: Color(hex: "005F73"), title: "AI Outfit Suggestions", value: stylistText, progress: stylistProgress, progressColor: Color(hex: "005F73"))
                    }
                    
                    Spacer()
                    
                    // Note & CTA
                    if !tierNote.isEmpty {
                        Text(tierNote)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(Color(hex: "7900FF"))
                    }
                    
                    Button(action: {}) {
                        Text(btnText)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(tier == "basic" ? .white : (tier == "freemium" ? Color(hex: "505050") : .white))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(btnBackground)
                            .cornerRadius(16)
                            .shadow(color: tier == "pro" ? Color(hex: "7900FF").opacity(0.2) : .clear, radius: 10, y: 5)
                    }
                }
                .padding(24)
            }
            .background(Color.white)
            .cornerRadius(32)
            .shadow(color: Color.black.opacity(0.1), radius: 20)
            .overlay(RoundedRectangle(cornerRadius: 32).stroke(Color(hex: "E0E0E0")))
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
        }
    }
    
    // Computed Properties for Data
    var tierName: String {
        switch tier {
        case "freemium": return "Free"
        case "basic": return "Basic"
        default: return "Pro"
        }
    }
    
    var tierPrice: String {
        if tier == "freemium" { return "$0" }
        if tier == "basic" { return billing == "monthly" ? "$9.99" : "$89.99" }
        return billing == "monthly" ? "$19.99" : "$179.99"
    }
    
    var tierPeriod: String {
        if tier == "freemium" { return "/forever" }
        return billing == "monthly" ? "/mo" : "/yr"
    }
    
    var adsText: String { tier == "freemium" ? "No" : "Yes" }
    var adsColor: Color { tier == "freemium" ? Color.red.opacity(0.1) : Color.green.opacity(0.1) }
    
    var wardrobeText: String {
        if tier == "freemium" { return "50 Items" }
        if tier == "basic" { return "100 Items" }
        return "Unlimited"
    }
    var wardrobeProgress: CGFloat {
        if tier == "freemium" { return 0.1 }
        if tier == "basic" { return 0.2 }
        return 1.0
    }
    
    var tryonText: String {
        if tier == "freemium" { return "3 Credits" }
        if tier == "basic" { return "50 /mo" }
        return "100 /mo"
    }
    var tryonProgress: CGFloat {
        if tier == "freemium" { return 0.03 }
        if tier == "basic" { return 0.5 }
        return 1.0
    }
    
    var analysisText: String {
        if tier == "freemium" { return "20 Credits" }
        if tier == "basic" { return "100 /mo" }
        return "300 /mo"
    }
    var analysisProgress: CGFloat {
        if tier == "freemium" { return 0.06 }
        if tier == "basic" { return 0.33 }
        return 1.0
    }
    
    var stylistText: String {
        if tier == "freemium" { return "30 Credits" }
        if tier == "basic" { return "200 /mo" }
        return "300 /mo"
    }
    var stylistProgress: CGFloat {
        if tier == "freemium" { return 0.1 }
        if tier == "basic" { return 0.66 }
        return 1.0
    }
    
    var tierNote: String {
        tier == "pro" ? "✨ Includes Daily Auto-Outfits (Weather + Calendar)" : ""
    }
    
    var btnText: String {
        if tier == "freemium" { return "Continue for Free" }
        if tier == "basic" { return "Select Basic Plan" }
        return "Go Limitless with Pro"
    }
    
    var btnBackground: AnyShapeStyle {
        if tier == "freemium" { return AnyShapeStyle(Color.white) }
        if tier == "basic" { return AnyShapeStyle(Color(hex: "0A0A0A")) }
        return AnyShapeStyle(LinearGradient(colors: [Color(hex: "7900FF"), Color(hex: "5A00CC")], startPoint: .leading, endPoint: .trailing))
    }
}

struct TierTab: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 12, weight: .bold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(isSelected ? Color(hex: "7900FF") : Color.white)
                .foregroundColor(isSelected ? .white : Color(hex: "505050"))
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(isSelected ? Color.clear : Color(hex: "E0E0E0")))
                .shadow(color: isSelected ? Color(hex: "7900FF").opacity(0.3) : .clear, radius: 8, y: 4)
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let color: Color
    let title: String
    let value: String
    var progress: CGFloat = 0
    var progressColor: Color = .clear
    var isBadge: Bool = false
    var badgeColor: Color = .clear
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Icon Box
            Text(icon)
                .font(.system(size: 20))
                .frame(width: 42, height: 42)
                .background(Color(hex: "F9FAFB"))
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(hex: "F3F4F6")))
            
            VStack(spacing: 6) {
                HStack {
                    Text(title)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(hex: "505050"))
                    Spacer()
                    
                    if isBadge {
                        Text(value)
                            .font(.system(size: 10, weight: .bold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(badgeColor)
                            .foregroundColor(value == "No" ? .red : .green)
                            .cornerRadius(99)
                    } else {
                        Text(value)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(hex: "505050"))
                    }
                }
                
                if !isBadge {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Color(hex: "E5E7EB"))
                            Capsule().fill(progressColor).frame(width: geo.size.width * progress)
                        }
                    }
                    .frame(height: 6)
                }
            }
            .padding(.top, 4)
        }
    }
}

// MARK: - Helpers
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    OnboardingView()
}
