<div align="center">

<img src="https://raw.githubusercontent.com/dex-ovo-studio/dex-ovo-studio/main/assets/studio-banner.svg" alt="D.E.X Studio" width="100%">

# Software directory & downloads

[简体中文](README.md) · **English**

**Project status · Official versions · Guides · Release archives**

[Software](#software) · [Install](#install) · [History](#history) · [Support](#support)

</div>

---

## Software

| Software | Purpose / platform | Version | Status | Downloads / details |
| :--- | :--- | :--- | :--- | :--- |
| **[Navio](https://github.com/dex-ovo-studio/Navio)** | Proxy management · Windows x64 | 1.0.0-beta.7 | Public beta · Regular updates | [Download](https://github.com/dex-ovo-studio/Navio/releases/tag/v1.0.0-beta.7) · [Guide (中文)](https://github.com/dex-ovo-studio/Navio/blob/main/docs/guide.md) |
| **[Mystery](https://github.com/dex-ovo-studio/Mystery)** | Mystery box & lucky draw · Windows x64 | 2.1.0 | Stable release · Stable support | [Download](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/releases/tag/mystery-v2.1.0) · [Website](https://mystery.mydex.top) |
| **[Tune](https://github.com/dex-ovo-studio/DEX-TUNE)** | Portable tuning toolkit · Windows / USB | 0.8 | Internal prototype | [Status](https://github.com/dex-ovo-studio/DEX-TUNE/blob/main/STATUS.md) · No public installer |
| **[Rovelio](https://github.com/dex-ovo-studio/DEX-Rider)** | Motorcycle dashboard · Raspberry Pi | Rebuild 01 | Development prototype | [Status](https://github.com/dex-ovo-studio/DEX-Rider/blob/main/STATUS.md) · No public image |

All four are projects by D.E.X Studio, listed together with their individual stages.

Tune status is based on the 2026-11-11 development report; Rovelio status is based on the 2026-09-06 development conversation. Devices were not retested during this documentation update. Internal prototypes are not public releases.

## Install

| App | Official package | Before upgrading |
| :--- | :--- | :--- |
| **Navio** | [Windows x64 installer](https://github.com/dex-ovo-studio/Navio/releases/download/v1.0.0-beta.7/Navio-v1.0.0-beta.7-Windows-x64-setup.exe) · [Portable ZIP](https://github.com/dex-ovo-studio/Navio/releases/download/v1.0.0-beta.7/Navio-v1.0.0-beta.7-Windows-x64-portable.zip) | Back up configuration and read the [release notes](https://github.com/dex-ovo-studio/Navio/releases/tag/v1.0.0-beta.7) |
| **Mystery** | [Windows x64 installer](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/releases/download/mystery-v2.1.0/DEX-Setup-2.1.0-x64.exe) | Back up local data and quit Mystery before installing |

Navio remains a public beta. Review its [known limitations](https://github.com/dex-ovo-studio/Navio/blob/main/README.en.md) before downloading. No public Android, macOS or Linux installers are currently available.

Mystery is a product by D.E.X Studio; existing installers retain historical D.E.X branding. The current release remains available with maintenance and feedback channels; routine feature updates are on hold.

<details>
<summary><strong>Mystery installer verification</strong></summary>

| Item | Details |
| :--- | :--- |
| Version | 2.1.0 |
| Filename | `DEX-Setup-2.1.0-x64.exe` |
| Size | 140,793,551 bytes |

SHA-256:

```text
ff206d3eece2740ea557cc46e8571341cd3acf4b74d073806eb99c5a0d126880
```

```powershell
Get-FileHash -LiteralPath .\DEX-Setup-2.1.0-x64.exe -Algorithm SHA256
```

Download the installer from the versioned release page. Automatic source archives contain this repository's documentation, not the client source or installer. The website download can change with later releases. Verify the version, filename and source.

</details>

## History

[Navio release archive](https://github.com/dex-ovo-studio/Navio/releases)

<details>
<summary><strong>Mystery release archive</strong></summary>

| Version | Stage | Download |
| :--- | :--- | :--- |
| 2.1.0 | Current stable | [Release](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/releases/tag/mystery-v2.1.0) |
| 2.0.0 | Historical | [Release](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/releases/tag/mystery-v2.0.0) |
| 1.3.0 Local Test | Local only | Not publicly available |
| 1.2.0 | Historical | [Release](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/releases/tag/mystery-v1.2.0) |
| 1.1.0 | Historical | [Release](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/releases/tag/mystery-v1.1.0) |
| 1.0.0 | Historical | [Release](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/releases/tag/mystery-v1.0.0) |
| 0.2.0 | Early release | [Release](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/releases/tag/mystery-v0.2.0) |

Archives preserve original installers and may not cover every historical build. Older versions may have known issues or be incompatible with current account services. Each archived release provides file details and SHA-256 checksums.

</details>

## Support

| Maintenance stage | Meaning |
| :--- | :--- |
| **Regular updates** | Routine releases, maintenance and feedback channels; currently Navio |
| **Stable support** | Maintenance for the current release, with routine feature updates on hold; currently Mystery |
| **End of support** | No further maintenance; migration plans follow project announcements |

Maintenance stage is separate from release maturity. This page is not a live uptime monitor or a response-time commitment.

- **Navio:** [Issues](https://github.com/dex-ovo-studio/Navio/issues).
- **Mystery:** [Official website](https://mystery.mydex.top).
- **Directory corrections:** [Report incorrect versions, statuses or links](https://github.com/dex-ovo-studio/DEX-Studio-Software-Status/issues).

Include the app version, operating system and reproduction steps; omit account credentials and private information.

<div align="center">

<sub>Reviewed: 2026-11-15 · [D.E.X Studio](https://github.com/dex-ovo-studio)</sub>

</div>
