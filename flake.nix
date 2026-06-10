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
