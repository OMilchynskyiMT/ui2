{
  description = "new ui";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    supportedSystems = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];

    eachSystem = nixpkgs.lib.genAttrs supportedSystems (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
        nativeBuildInputs = with pkgs; [
          nodejs_22
          typescript
        ];
        buildInputs = [];
      in {
        devShell = pkgs.mkShell {
          inherit nativeBuildInputs buildInputs;
          packages = [];
          shellHook = ''
            echo "Node.js version: $(node --version)"
            echo "TypeScript version: $(tsc --version)"

            echo "Configuring LAN firewall rule for port 5173..."
            if doas nft add rule inet nixos-fw input ip saddr 192.168.1.0/24 tcp dport 5173 accept 2>/dev/null; then
              echo "✓ Port 5173 opened for 192.168.1.0/24"
              trap 'echo "Removing firewall rule..."; doas nft delete rule inet nixos-fw input ip saddr 192.168.1.0/24 tcp dport 5173 accept' EXIT
            else
              echo "✗ Failed to apply firewall rule. Did you cancel the password prompt?"
            fi
          '';
        };
      }
    );
  in {
    devShells =
      nixpkgs.lib.mapAttrs (system: systemAttrs: {
        default = systemAttrs.devShell;
      })
      eachSystem;
  };
}
