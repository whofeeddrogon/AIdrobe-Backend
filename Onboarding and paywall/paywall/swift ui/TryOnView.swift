import SwiftUI

struct TryOnView: View {
    @State private var selectedPack: String = "pack2"
    
    var body: some View {
        ZStack {
            // Background
            Color(hex: "F5F5F7")
                .edgesIgnoringSafeArea(.all)
            
            // Ambient Glow
            Circle()
                .fill(
                    RadialGradient(gradient: Gradient(colors: [Color(hex: "7900FF").opacity(0.25), Color.white.opacity(0)]), center: .center, startRadius: 0, endRadius: 150)
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
                            .foregroundColor(Color(hex: "505050"))
                            .frame(width: 40, height: 40)
                            .background(Color.white.opacity(0.5))
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(Color.white.opacity(0.5), lineWidth: 1)
                            )
                            .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
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
                                .fill(LinearGradient(gradient: Gradient(colors: [Color.white, Color(hex: "F0F0F0")]), startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 80, height: 80)
                                .shadow(color: Color.black.opacity(0.1), radius: 12, x: 0, y: 10)
                                .overlay(
                                    Text("👕")
                                        .font(.system(size: 40))
                                )
                                .offset(y: -10)
                            
                            // Sparkle 1
                            Circle()
                                .fill(LinearGradient(gradient: Gradient(colors: [Color.white, Color(hex: "F0F0F0")]), startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 50, height: 50)
                                .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 5)
                                .overlay(
                                    Text("👗")
                                        .font(.system(size: 24))
                                )
                                .offset(x: -70, y: 50)
                            
                            // Sparkle 2
                            Circle()
                                .fill(LinearGradient(gradient: Gradient(colors: [Color.white, Color(hex: "F0F0F0")]), startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 60, height: 60)
                                .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 5)
                                .overlay(
                                    Text("🧥")
                                        .font(.system(size: 28))
                                )
                                .offset(x: 60, y: 40)
                        }
                        .frame(height: 220)
                        .padding(.bottom, 10)
                        
                        // Header
                        VStack(spacing: 8) {
                            Text("Out of Try-Ons?")
                                .font(.system(size: 30, weight: .black))
                                .foregroundColor(Color(hex: "0A0A0A"))
                                .multilineTextAlignment(.center)
                            
                            Text("Visualize more outfits on yourself instantly.")
                                .font(.system(size: 14))
                                .foregroundColor(Color(hex: "505050"))
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
                                            .stroke(selectedPack == "pack1" ? Color(hex: "7900FF") : Color(hex: "D1D5DB"), lineWidth: 2)
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
                                            Text("10 Try-Ons")
                                                .font(.system(size: 18, weight: .bold))
                                                .foregroundColor(Color(hex: "0A0A0A"))
                                            Spacer()
                                            Text("$2.99")
                                                .font(.system(size: 18, weight: .bold))
                                                .foregroundColor(Color(hex: "0A0A0A"))
                                        }
                                        
                                        HStack {
                                            Text("Quick style check")
                                                .font(.system(size: 12, weight: .medium))
                                                .foregroundColor(Color(hex: "505050"))
                                            Spacer()
                                            Text("$0.30 / credit")
                                                .font(.system(size: 10))
                                                .foregroundColor(Color.gray)
                                        }
                                    }
                                }
                                .padding(16)
                                .background(
                                    RoundedRectangle(cornerRadius: 24)
                                        .fill(selectedPack == "pack1" ? Color.white.opacity(0.95) : Color.white.opacity(0.7))
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 24)
                                        .stroke(selectedPack == "pack1" ? Color(hex: "7900FF") : Color.white.opacity(0.8), lineWidth: selectedPack == "pack1" ? 2 : 1)
                                )
                                .shadow(color: selectedPack == "pack1" ? Color(hex: "7900FF").opacity(0.2) : Color.black.opacity(0.03), radius: selectedPack == "pack1" ? 30 : 20, x: 0, y: selectedPack == "pack1" ? 10 : 4)
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
                                                .stroke(Color(hex: "F5F5F7"), lineWidth: 2)
                                        )
                                        .shadow(radius: 4)
                                        .offset(x: -16, y: -12)
                                        .zIndex(1)
                                    
                                    HStack(spacing: 16) {
                                        // Check Circle
                                        ZStack {
                                            Circle()
                                                .stroke(selectedPack == "pack2" ? Color(hex: "7900FF") : Color(hex: "D1D5DB"), lineWidth: 2)
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
                                                Text("30 Try-Ons")
                                                    .font(.system(size: 20, weight: .bold))
                                                    .foregroundColor(selectedPack == "pack2" ? Color(hex: "7900FF") : Color(hex: "0A0A0A"))
                                                Spacer()
                                                Text("$5.99")
                                                    .font(.system(size: 20, weight: .bold))
                                                    .foregroundColor(selectedPack == "pack2" ? Color(hex: "7900FF") : Color(hex: "0A0A0A"))
                                            }
                                            
                                            HStack {
                                                Text("Full wardrobe refresh")
                                                    .font(.system(size: 12, weight: .medium))
                                                    .foregroundColor(Color(hex: "505050"))
                                                Spacer()
                                                HStack(spacing: 8) {
                                                    Text("$8.99")
                                                        .font(.system(size: 10))
                                                        .foregroundColor(Color.gray)
                                                        .strikethrough()
                                                    
                                                    Text("$0.20 / credit")
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
                                            .fill(selectedPack == "pack2" ? Color.white.opacity(0.95) : Color.white.opacity(0.7))
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 24)
                                            .stroke(selectedPack == "pack2" ? Color(hex: "7900FF") : Color.white.opacity(0.8), lineWidth: selectedPack == "pack2" ? 2 : 1)
                                    )
                                    .shadow(color: selectedPack == "pack2" ? Color(hex: "7900FF").opacity(0.2) : Color.black.opacity(0.03), radius: selectedPack == "pack2" ? 30 : 20, x: 0, y: selectedPack == "pack2" ? 10 : 4)
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
                        Text(selectedPack == "pack1" ? "Purchase 10 Try-Ons - $2.99" : "Purchase 30 Try-Ons - $5.99")
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
                            .fill(Color.white)
                            .frame(width: 40, height: 40)
                            .shadow(radius: 1)
                            .overlay(Text("💎").font(.system(size: 20)))
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Need more looks?")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(Color(hex: "0A0A0A"))
                            
                            Text("Upgrade to Pro and get ")
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: "505050"))
                            + Text("100 try-ons monthly")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(Color(hex: "7900FF"))
                            + Text(".")
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: "505050"))
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            // View Pro action
                        }) {
                            Text("View Pro")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color(hex: "0A0A0A"))
                                .cornerRadius(8)
                        }
                    }
                    .padding(16)
                    .background(
                        LinearGradient(gradient: Gradient(colors: [Color(hex: "7900FF").opacity(0.05), Color(hex: "00BFFF").opacity(0.05)]), startPoint: .leading, endPoint: .trailing)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color(hex: "7900FF").opacity(0.1), lineWidth: 1)
                    )
                    .cornerRadius(16)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }
}

struct TryOnView_Previews: PreviewProvider {
    static var previews: some View {
        TryOnView()
    }
}
