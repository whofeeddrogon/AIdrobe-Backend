import SwiftUI

struct SuggestionDarkView: View {
    @State private var selectedPack: String = "pack2"
    
    var body: some View {
        ZStack {
            // Background
            Color(hex: "0A0A0A")
                .edgesIgnoringSafeArea(.all)
            
            // Ambient Glow
            Circle()
                .fill(
                    RadialGradient(gradient: Gradient(colors: [Color(hex: "7900FF").opacity(0.15), Color.black.opacity(0)]), center: .center, startRadius: 0, endRadius: 150)
                )
                .frame(width: 300, height: 300)
                .position(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height * 0.2)
            
            VStack(spacing: 0) {
                // Close Button
                HStack {
                    Button(action: {
                        // Close action
                    }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(Color(hex: "E0E0E0"))
                            .frame(width: 40, height: 40)
                            .background(Color.white.opacity(0.1))
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
                            )
                    }
                    Spacer()
                }
                .padding(.top, 20)
                .padding(.leading, 24)
                .zIndex(50)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        // 3D Illustration Area
                        ZStack {
                            // Main Icon
                            Circle()
                                .fill(LinearGradient(gradient: Gradient(colors: [Color(hex: "202020"), Color(hex: "151515")]), startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 80, height: 80)
                                .shadow(color: Color.black.opacity(0.5), radius: 12, x: 0, y: 10)
                                .overlay(
                                    Circle()
                                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                                )
                                .overlay(
                                    Text("💡")
                                        .font(.system(size: 40))
                                )
                                .offset(y: -10)
                            
                            // Sparkle 1
                            Circle()
                                .fill(LinearGradient(gradient: Gradient(colors: [Color(hex: "202020"), Color(hex: "151515")]), startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 40, height: 40)
                                .shadow(color: Color.black.opacity(0.5), radius: 8, x: 0, y: 5)
                                .overlay(
                                    Circle()
                                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                                )
                                .overlay(
                                    Text("✨")
                                        .font(.system(size: 20))
                                )
                                .offset(x: -80, y: 60)
                            
                            // Sparkle 2
                            Circle()
                                .fill(LinearGradient(gradient: Gradient(colors: [Color(hex: "202020"), Color(hex: "151515")]), startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 50, height: 50)
                                .shadow(color: Color.black.opacity(0.5), radius: 8, x: 0, y: 5)
                                .overlay(
                                    Circle()
                                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                                )
                                .overlay(
                                    Text("💭")
                                        .font(.system(size: 24))
                                )
                                .offset(x: 70, y: 50)
                        }
                        .frame(height: 220)
                        .padding(.bottom, 10)
                        
                        // Header
                        VStack(spacing: 8) {
                            Text("Need Inspiration?")
                                .font(.system(size: 30, weight: .black))
                                .foregroundColor(Color.white)
                                .multilineTextAlignment(.center)
                            
                            Text("Get more smart outfit suggestions from your AI stylist.")
                                .font(.system(size: 14))
                                .foregroundColor(Color(hex: "A0A0A0"))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 16)
                        }
                        .padding(.bottom, 32)
                        
                        // Packages
                        VStack(spacing: 24) {
                            // Pack 1
                            Button(action: {
                                selectedPack = "pack1"
                            }) {
                                HStack(spacing: 16) {
                                    // Check Circle
                                    ZStack {
                                        Circle()
                                            .stroke(selectedPack == "pack1" ? Color(hex: "7900FF") : Color(hex: "404040"), lineWidth: 2)
                                            .frame(width: 20, height: 20)
                                        
                                        if selectedPack == "pack1" {
                                            Circle()
                                                .fill(Color(hex: "7900FF"))
                                                .frame(width: 20, height: 20)
                                            
                                            Circle()
                                                .fill(Color.white)
                                                .frame(width: 8, height: 8)
                                        }
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack {
                                            Text("20 Credits")
                                                .font(.system(size: 18, weight: .bold))
                                                .foregroundColor(Color.white)
                                            Spacer()
                                            Text("$0.99")
                                                .font(.system(size: 18, weight: .bold))
                                                .foregroundColor(Color.white)
                                        }
                                        
                                        HStack {
                                            Text("Quick inspiration")
                                                .font(.system(size: 12, weight: .medium))
                                                .foregroundColor(Color(hex: "A0A0A0"))
                                            Spacer()
                                            Text("$0.05 / idea")
                                                .font(.system(size: 10))
                                                .foregroundColor(Color.gray)
                                        }
                                    }
                                }
                                .padding(16)
                                .background(
                                    RoundedRectangle(cornerRadius: 24)
                                        .fill(selectedPack == "pack1" ? Color(hex: "1A1A1A") : Color(hex: "151515"))
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 24)
                                        .stroke(selectedPack == "pack1" ? Color(hex: "7900FF") : Color.white.opacity(0.1), lineWidth: selectedPack == "pack1" ? 2 : 1)
                                )
                                .shadow(color: selectedPack == "pack1" ? Color(hex: "7900FF").opacity(0.2) : Color.black.opacity(0.2), radius: selectedPack == "pack1" ? 30 : 20, x: 0, y: selectedPack == "pack1" ? 10 : 4)
                            }
                            .scaleEffect(selectedPack == "pack1" ? 1.0 : 0.98)
                            .animation(.spring(), value: selectedPack)
                            
                            // Pack 2
                            Button(action: {
                                selectedPack = "pack2"
                            }) {
                                ZStack(alignment: .topTrailing) {
                                    // Best Value Badge
                                    Text("BEST VALUE")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 4)
                                        .background(Color(hex: "7900FF"))
                                        .clipShape(Capsule())
                                        .overlay(
                                            Capsule()
                                                .stroke(Color(hex: "0A0A0A"), lineWidth: 2)
                                        )
                                        .shadow(radius: 4)
                                        .offset(x: -16, y: -12)
                                        .zIndex(1)
                                    
                                    HStack(spacing: 16) {
                                        // Check Circle
                                        ZStack {
                                            Circle()
                                                .stroke(selectedPack == "pack2" ? Color(hex: "7900FF") : Color(hex: "404040"), lineWidth: 2)
                                                .frame(width: 20, height: 20)
                                            
                                            if selectedPack == "pack2" {
                                                Circle()
                                                    .fill(Color(hex: "7900FF"))
                                                    .frame(width: 20, height: 20)
                                                
                                                Circle()
                                                    .fill(Color.white)
                                                    .frame(width: 8, height: 8)
                                            }
                                        }
                                        
                                        VStack(alignment: .leading, spacing: 4) {
                                            HStack {
                                                Text("50 Credits")
                                                    .font(.system(size: 20, weight: .bold))
                                                    .foregroundColor(selectedPack == "pack2" ? Color(hex: "7900FF") : Color.white)
                                                Spacer()
                                                Text("$1.99")
                                                    .font(.system(size: 20, weight: .bold))
                                                    .foregroundColor(selectedPack == "pack2" ? Color(hex: "7900FF") : Color.white)
                                            }
                                            
                                            HStack {
                                                Text("Weekly looks sorted")
                                                    .font(.system(size: 12, weight: .medium))
                                                    .foregroundColor(Color(hex: "A0A0A0"))
                                                Spacer()
                                                HStack(spacing: 8) {
                                                    Text("$2.49")
                                                        .font(.system(size: 10))
                                                        .foregroundColor(Color.gray)
                                                        .strikethrough()
                                                    
                                                    Text("$0.04 / idea")
                                                        .font(.system(size: 10, weight: .bold))
                                                        .foregroundColor(Color.green)
                                                        .padding(.horizontal, 6)
                                                        .padding(.vertical, 2)
                                                        .background(Color.green.opacity(0.1))
                                                        .cornerRadius(4)
                                                }
                                            }
                                        }
                                    }
                                    .padding(16)
                                    .background(
                                        RoundedRectangle(cornerRadius: 24)
                                            .fill(selectedPack == "pack2" ? Color(hex: "1A1A1A") : Color(hex: "151515"))
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 24)
                                            .stroke(selectedPack == "pack2" ? Color(hex: "7900FF") : Color.white.opacity(0.1), lineWidth: selectedPack == "pack2" ? 2 : 1)
                                    )
                                    .shadow(color: selectedPack == "pack2" ? Color(hex: "7900FF").opacity(0.2) : Color.black.opacity(0.2), radius: selectedPack == "pack2" ? 30 : 20, x: 0, y: selectedPack == "pack2" ? 10 : 4)
                                }
                            }
                            .scaleEffect(selectedPack == "pack2" ? 1.0 : 0.98)
                            .animation(.spring(), value: selectedPack)
                        }
                        .padding(.bottom, 32)
                        
                        Spacer()
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 16)
                }
                
                // Footer
                VStack(spacing: 24) {
                    Button(action: {
                        // Purchase action
                    }) {
                        Text(selectedPack == "pack1" ? "Purchase 20 Credits - $0.99" : "Purchase 50 Credits - $1.99")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(
                                LinearGradient(gradient: Gradient(colors: [Color(hex: "7900FF"), Color(hex: "5A00CC")]), startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .cornerRadius(20)
                            .shadow(color: Color(hex: "7900FF").opacity(0.3), radius: 12, x: 0, y: 10)
                    }
                    
                    // Upsell Box
                    HStack(spacing: 12) {
                        Circle()
                            .fill(Color(hex: "202020"))
                            .frame(width: 40, height: 40)
                            .shadow(radius: 1)
                            .overlay(Text("💎").font(.system(size: 20)))
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Want daily style?")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(Color.white)
                            
                            Text("Upgrade to Pro and get ")
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: "A0A0A0"))
                            + Text("300 suggestions monthly")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(Color(hex: "7900FF"))
                            + Text(".")
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: "A0A0A0"))
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            // View Pro action
                        }) {
                            Text("View Pro")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color.white)
                                .cornerRadius(8)
                        }
                    }
                    .padding(16)
                    .background(
                        LinearGradient(gradient: Gradient(colors: [Color(hex: "7900FF").opacity(0.1), Color(hex: "00BFFF").opacity(0.1)]), startPoint: .leading, endPoint: .trailing)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color(hex: "7900FF").opacity(0.2), lineWidth: 1)
                    )
                    .cornerRadius(16)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }
}

struct SuggestionDarkView_Previews: PreviewProvider {
    static var previews: some View {
        SuggestionDarkView()
    }
}
