---
name: Pabalu Internal
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for high-utility internal operations, focusing on the lifecycle management of second-hand hardware. The brand personality is **reliable, efficient, and data-driven**, prioritizing clarity over decoration. 

The aesthetic follows a **Corporate / Modern** style, utilizing a sophisticated palette of deep slate and navy to establish a professional workspace. The interface relies on a clean, flat execution with purposeful whitespace to reduce cognitive load during complex service tracking and inventory management tasks. The goal is to evoke a sense of precision and technical competence for internal staff.

## Colors
This design system utilizes a tiered color architecture to differentiate between structural elements and actionable data.

- **Primary & Secondary:** The deep navy (#0f172a) is reserved for navigation and high-level headers, while the electric blue (#3b82f6) identifies primary actions and focus states.
- **Surface Colors:** The interface uses a clean white (#ffffff) background with subtle slate-50 (#f8fafc) fills for secondary containers to provide contrast without clutter.
- **Status Indicators:** A dedicated semantic palette is used for service tracking: 
  - **Available:** Emerald (#10b981)
  - **In-Progress:** Blue (#3b82f6)
  - **Received/Pending:** Amber (#f59e0b)
  - **Completed:** Violet (#8b5cf6)
  - **Sold/Archived:** Slate (#64748b)

## Typography
The system exclusively uses **Inter** to leverage its exceptional legibility in data-heavy environments. 

For inventory lists and service logs, use `body-md` as the standard text size. `label-md` should be applied to table headers and metadata descriptors to provide a clear visual break from the data itself. A `mono-data` fallback is recommended for serial numbers and technical specifications to ensure character distinction (e.g., 0 vs O). All headings should use a tighter letter spacing to maintain a compact, professional feel on dashboard layouts.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid** model. The sidebar navigation remains fixed at 280px, while the main content area scales to accommodate wide data tables. 

A strict **4px baseline grid** governs all spacing. 
- **Data Tables:** Use 12px vertical padding for rows to maintain density while ensuring touch-targets are accessible.
- **Forms:** Input groups should be stacked with 20px spacing, while grouped fields (e.g., Laptop Specs) use an 8px gutter.
- **Margins:** Standard page margins are set to 24px on desktop, scaling down to 16px on mobile devices.

## Elevation & Depth
Depth is signaled through **Tonal Layers** supplemented by **Ambient Shadows**. 

The base canvas is Slate-50. Main interactive cards and containers use a white surface with a "Low" elevation (0px 1px 3px rgba(0,0,0,0.1)). Modals and floating action menus utilize a "High" elevation with a more diffused shadow (0px 10px 25px rgba(15, 23, 42, 0.15)). Borders should be kept thin (1px) and use a light grey-blue (#e2e8f0) to define boundaries without adding visual weight.

## Shapes
The design system employs a **Rounded** shape language to soften the technical nature of the software. 

- **Cards & Containers:** 12px (rounded-xl) to provide a modern, contained feel for dashboard modules.
- **Buttons & Inputs:** 8px (rounded-lg) for a precise, professional appearance.
- **Status Badges:** Fully rounded (pill) to distinguish status indicators from clickable buttons.

## Components
- **Buttons:** Primary buttons use a solid Electric Blue fill with white text. Secondary buttons use a slate-100 ghost style.
- **Status Chips:** Small, pill-shaped badges with a low-opacity background tint of their respective status color and a high-contrast text color (e.g., "Available" uses 10% emerald background with 100% emerald text).
- **Data Tables:** Use zebra-striping (Slate-50) for long lists. Column headers must be uppercase `label-md` with a subtle bottom border.
- **Input Fields:** Use 1px #e2e8f0 borders. On focus, the border transitions to Electric Blue with a 2px outer glow.
- **Service Cards:** A custom component displaying laptop specs, current owner, and service status. Use a bold 1px border for the "Active" card to denote the current item being tracked.