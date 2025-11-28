import SwiftUI

struct PaywallDarkView: View {
    @State private var currentTier: String = "pro"
    @State private var currentBilling: String = "monthly"
    
    var body: some View {
        ZStack {
            // Background
            Color(hex: "0A0A0A")
                .edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 0) {
                // Top Bar (Mockup)
                HStack(alignment: .bottom) {
                    Text("9:41")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                    Spacer()
                    HStack(spacing: 4) {
                        Image(systemName: "cellularbars")
                        Image(systemName: "wifi")
                        Image(systemName: "battery.100")
                    }
                    .font(.system(size: 12))
                    .foregroundColor(.white)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 8)
                .frame(height: 56)
                
                // Content
                VStack(spacing: 0) {
                    // Header
                    VStack(spacing: 4) {
                        Text("Unlock Your Potential")
                            .font(.system(size: 24, weight: .black))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                        
                        Text("Compare plans & find your perfect fit.")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "A0A0A0"))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 24)
                    .padding(.bottom, 16)
                    
                    // Billing Toggle
                    HStack(spacing: 0) {
                        Button(action: {
                            currentBilling = "monthly"
                        }) {
                            Text("Monthly")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(currentBilling == "monthly" ? Color(hex: "7900FF") : Color(hex: "A0A0A0"))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 8)
                                .background(currentBilling == "monthly" ? Color(hex: "1A1A1A") : Color.clear)
                                .cornerRadius(999)
                                .shadow(color: currentBilling == "monthly" ? Color.black.opacity(0.2) : Color.clear, radius: 2, x: 0, y: 1)
                        }
                        
                        Button(action: {
                            currentBilling = "yearly"
                        }) {
                            ZStack {
                                Text("Yearly")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(currentBilling == "yearly" ? Color(hex: "7900FF") : Color(hex: "A0A0A0"))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 8)
                                    .background(currentBilling == "yearly" ? Color(hex: "1A1A1A") : Color.clear)
                                    .cornerRadius(999)
                                    .shadow(color: currentBilling == "yearly" ? Color.black.opacity(0.2) : Color.clear, radius: 2, x: 0, y: 1)
                                
                                Text("SAVE 25%")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color(hex: "00BFFF"))
                                    .cornerRadius(999)
                                    .offset(x: 30, y: -12)
                            }
                        }
                    }
                    .padding(4)
                    .background(Color(hex: "202020"))
                    .cornerRadius(999)
                    .frame(maxWidth: 280)
                    .padding(.bottom, 16)
                    
                    // Tier Tabs
                    HStack(spacing: 8) {
                        TierTabButtonDark(title: "Free", isSelected: currentTier == "freemium") {
                            currentTier = "freemium"
                        }
                        
                        TierTabButtonDark(title: "Basic", isSelected: currentTier == "basic") {
                            currentTier = "basic"
                        }
                        
                        ZStack {
                            TierTabButtonDark(title: "Pro", isSelected: currentTier == "pro") {
                                currentTier = "pro"
                            }
                            
                            if currentTier == "pro" {
                                Text("MOST POPULAR")
                                    .font(.system(size: 7, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(Color(hex: "00BFFF"))
                                    .cornerRadius(999)
                                    .overlay(
                                        Capsule()
                                            .stroke(Color(hex: "0A0A0A"), lineWidth: 2)
                                    )
                                    .offset(y: -20)
                                    .shadow(color: Color(hex: "00BFFF").opacity(0.3), radius: 4, x: 0, y: 2)
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 12)
                    
                    // Card Container
                    VStack {
                        ZStack {
                            // Background Blur
                            Circle()
                                .fill(Color(hex: "C8A2C8").opacity(0.2))
                                .frame(width: 224, height: 224)
                                .blur(radius: 40)
                                .offset(x: 100, y: -150)
                            
                            VStack(spacing: 0) {
                                // Tier Info
                                Text(tierName)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(Color(hex: "A0A0A0"))
                                    .textCase(.uppercase)
                                    .tracking(2)
                                    .padding(.bottom, 4)
                                
                                HStack(alignment: .bottom, spacing: 4) {
                                    Text(tierPrice)
                                        .font(.system(size: 36, weight: .black))
                                        .foregroundColor(.white)
                                    
                                    Text(tierPeriod)
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(Color(hex: "A0A0A0"))
                                        .padding(.bottom, 6)
                                }
                                .padding(.bottom, 20)
                                
                                // Features List
                                ScrollView(showsIndicators: false) {
                                    VStack(spacing: 20) {
                                        // Ads Feature
                                        HStack(spacing: 16) {
                                            ZStack {
                                                RoundedRectangle(cornerRadius: 12)
                                                    .stroke(Color(hex: "303030"), lineWidth: 1)
                                                    .background(Color(hex: "202020"))
                                                    .cornerRadius(12)
                                                    .frame(width: 42, height: 42)
                                                
                                                Text("🚫")
                                                    .font(.system(size: 20))
                                                    .foregroundColor(currentTier == "freemium" ? .red : .green)
                                            }
                                            
                                            HStack {
                                                Text("Ad-Free Experience")
                                                    .font(.system(size: 12, weight: .bold))
                                                    .foregroundColor(Color(hex: "A0A0A0"))
                                                Spacer()
                                                Text(adsText)
                                                    .font(.system(size: 10, weight: .bold))
                                                    .padding(.horizontal, 8)
                                                    .padding(.vertical, 2)
                                                    .background(adsColor.opacity(0.2))
                                                    .foregroundColor(adsColor)
                                                    .cornerRadius(999)
                                            }
                                        }
                                        
                                        // Other Features
                                        FeatureRowDark(icon: "👚", color: Color(hex: "7900FF"), title: "Wardrobe Limit", value: wardrobeText, progress: wardrobeWidth)
                                        FeatureRowDark(icon: "🪄", color: Color(hex: "00BFFF"), title: "Virtual Try-On", value: tryonText, progress: tryonWidth)
                                        FeatureRowDark(icon: "🔍", color: Color(hex: "5A00CC"), title: "Clothing Analysis", value: analysisText, progress: analysisWidth)
                                        FeatureRowDark(icon: "✨", color: Color(hex: "005F73"), title: "AI Outfit Suggestions", value: stylistText, progress: stylistWidth)
                                    }
                                    .padding(.trailing, 4)
                                }
                                
                                Spacer()
                                
                                // Note
                                Text(tierNote)
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(Color(hex: "7900FF"))
                                    .tracking(0.5)
                                    .frame(height: 16)
                                    .padding(.top, 12)
                                    .padding(.bottom, 4)
                                    .opacity(tierNote.isEmpty ? 0 : 1)
                                
                                // CTA Button
                                Button(action: {
                                    // Purchase action
                                }) {
                                    Text(btnText)
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(currentTier == "freemium" ? Color(hex: "A0A0A0") : .white)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 16)
                                        .background(
                                            Group {
                                                if currentTier == "pro" {
                                                    LinearGradient(gradient: Gradient(colors: [Color(hex: "7900FF"), Color(hex: "5A00CC")]), startPoint: .leading, endPoint: .trailing)
                                                } else if currentTier == "basic" {
                                                    Color(hex: "202020")
                                                } else {
                                                    Color(hex: "151515")
                                                }
                                            }
                                        )
                                        .cornerRadius(12)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(Color(hex: "303030"), lineWidth: currentTier == "freemium" ? 1 : 0)
                                        )
                                        .shadow(color: currentTier == "pro" ? Color(hex: "7900FF").opacity(0.2) : (currentTier == "basic" ? Color.black.opacity(0.2) : Color.clear), radius: 10, x: 0, y: 4)
                                }
                            }
                            .padding(24)
                        }
                    }
                    .background(Color(hex: "151515"))
                    .cornerRadius(32)
                    .shadow(color: Color.black.opacity(0.3), radius: 20, x: 0, y: 10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 32)
                            .stroke(Color(hex: "303030"), lineWidth: 1)
                    )
                    .padding(.horizontal, 24)
                    .padding(.bottom, 16)
                    
                    Text("Cancel anytime from settings.")
                        .font(.system(size: 10))
                        .foregroundColor(Color(hex: "505050"))
                        .padding(.bottom, 24)
                }
            }
        }
    }
    
    // Computed Properties for Data
    var tierName: String {
        switch currentTier {
        case "freemium": return "Free"
        case "basic": return "Basic"
        case "pro": return "Pro"
        default: return ""
        }
    }
    
    var tierPrice: String {
        if currentTier == "freemium" { return "$0" }
        if currentTier == "basic" { return currentBilling == "monthly" ? "$9.99" : "$89.99" }
        return currentBilling == "monthly" ? "$19.99" : "$179.99"
    }
    
    var tierPeriod: String {
        if currentTier == "freemium" { return "/forever" }
        return currentBilling == "monthly" ? "/mo" : "/yr"
    }
    
    var adsText: String {
        return currentTier == "freemium" ? "No" : "Yes"
    }
    
    var adsColor: Color {
        return currentTier == "freemium" ? .red : Color(hex: "005F73")
    }
    
    var wardrobeText: String {
        switch currentTier {
        case "freemium": return "50 Items"
        case "basic": return "100 Items"
        case "pro": return "Unlimited"
        default: return ""
        }
    }
    
    var wardrobeWidth: CGFloat {
        switch currentTier {
        case "freemium": return 0.1
        case "basic": return 0.2
        case "pro": return 1.0
        default: return 0
        }
    }
    
    var tryonText: String {
        switch currentTier {
        case "freemium": return "3 Credits"
        case "basic": return "50 /mo"
        case "pro": return "100 /mo"
        default: return ""
        }
    }
    
    var tryonWidth: CGFloat {
        switch currentTier {
        case "freemium": return 0.03
        case "basic": return 0.5
        case "pro": return 1.0
        default: return 0
        }
    }
    
    var analysisText: String {
        switch currentTier {
        case "freemium": return "20 Credits"
        case "basic": return "100 /mo"
        case "pro": return "300 /mo"
        default: return ""
        }
    }
    
    var analysisWidth: CGFloat {
        switch currentTier {
        case "freemium": return 0.06
        case "basic": return 0.33
        case "pro": return 1.0
        default: return 0
        }
    }
    
    var stylistText: String {
        switch currentTier {
        case "freemium": return "30 Credits"
        case "basic": return "200 /mo"
        case "pro": return "300 /mo"
        default: return ""
        }
    }
    
    var stylistWidth: CGFloat {
        switch currentTier {
        case "freemium": return 0.1
        case "basic": return 0.66
        case "pro": return 1.0
        default: return 0
        }
    }
    
    var tierNote: String {
        return currentTier == "pro" ? "✨ Includes Daily Auto-Outfits (Weather + Calendar)" : ""
    }
    
    var btnText: String {
        switch currentTier {
        case "freemium": return "Continue for Free"
        case "basic": return "Select Basic Plan"
        case "pro": return "Go Limitless with Pro"
        default: return ""
        }
    }
}

struct TierTabButtonDark: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(isSelected ? .white : Color(hex: "A0A0A0"))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(isSelected ? Color(hex: "7900FF") : Color(hex: "151515"))
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color(hex: "303030"), lineWidth: isSelected ? 0 : 1)
                )
                .shadow(color: isSelected ? Color(hex: "7900FF").opacity(0.3) : Color.clear, radius: 12, x: 0, y: 4)
        }
    }
}

struct FeatureRowDark: View {
    let icon: String
    let color: Color
    let title: String
    let value: String
    let progress: CGFloat
    
    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color(hex: "303030"), lineWidth: 1)
                    .background(Color(hex: "202020"))
                    .cornerRadius(12)
                    .frame(width: 42, height: 42)
                
                Text(icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(title)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(hex: "A0A0A0"))
                    Spacer()
                    Text(value)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(hex: "A0A0A0"))
                }
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 999)
                            .fill(Color(hex: "303030"))
                            .frame(height: 6)
                        
                        RoundedRectangle(cornerRadius: 999)
                            .fill(progress < 0.15 ? Color.gray.opacity(0.5) : color)
                            .frame(width: geometry.size.width * progress, height: 6)
                            .animation(.easeOut(duration: 0.6), value: progress)
                    }
                }
                .frame(height: 6)
            }
        }
    }
}

struct PaywallDarkView_Previews: PreviewProvider {
    static var previews: some View {
        PaywallDarkView()
    }
}
