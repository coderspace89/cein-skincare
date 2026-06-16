import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksBenefitsSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_benefits_sections';
  info: {
    displayName: 'Benefits Section';
  };
  attributes: {
    benefitsText: Schema.Attribute.Blocks;
    howToUse: Schema.Attribute.Blocks;
    image: Schema.Attribute.Media<'images'>;
    ingredients: Schema.Attribute.Blocks;
  };
}

export interface BlocksHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_hero_sections';
  info: {
    displayName: 'Hero Section';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images', true>;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksImageWithText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_with_texts';
  info: {
    displayName: 'ImageWithText';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksJournalGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_journal_grids';
  info: {
    displayName: 'JournalGrid';
  };
  attributes: {
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksListingHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_listing_heroes';
  info: {
    displayName: 'Listing Hero';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksNavColumn extends Struct.ComponentSchema {
  collectionName: 'components_blocks_nav_columns';
  info: {
    displayName: 'Nav Column';
  };
  attributes: {
    links: Schema.Attribute.Component<'elements.nav-link', true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksProductCarousel extends Struct.ComponentSchema {
  collectionName: 'components_blocks_product_carousels';
  info: {
    displayName: 'ProductCarousel';
  };
  attributes: {
    description: Schema.Attribute.Text;
    productHandles: Schema.Attribute.Component<
      'elements.product-handles',
      true
    >;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
    viewAllLabel: Schema.Attribute.String;
    viewAllUrl: Schema.Attribute.String;
  };
}

export interface BlocksPromoModal extends Struct.ComponentSchema {
  collectionName: 'components_blocks_promo_modals';
  info: {
    displayName: 'Promo Modal';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#f4f4f0'>;
    buttonLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    disclaimerText: Schema.Attribute.RichText;
    image: Schema.Attribute.Media<'images'>;
    inputPlaceholder: Schema.Attribute.String;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksReviewsSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_reviews_sections';
  info: {
    displayName: 'Reviews Section';
  };
  attributes: {
    comment: Schema.Attribute.Text;
    dateText: Schema.Attribute.Date;
    rating: Schema.Attribute.Integer;
    reviewerName: Schema.Attribute.String;
    reviewTitle: Schema.Attribute.String;
  };
}

export interface BlocksRoutineWidget extends Struct.ComponentSchema {
  collectionName: 'components_blocks_routine_widgets';
  info: {
    displayName: 'Routine Widget';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String;
    stepNumber: Schema.Attribute.Integer;
  };
}

export interface BlocksTextOverImage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_text_over_images';
  info: {
    displayName: 'TextOverImage';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    ctaLabel: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    description: Schema.Attribute.RichText;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksTextStatement extends Struct.ComponentSchema {
  collectionName: 'components_blocks_text_statements';
  info: {
    displayName: 'TextStatement';
  };
  attributes: {
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.Text;
  };
}

export interface BlocksUserVoiceGallery extends Struct.ComponentSchema {
  collectionName: 'components_blocks_user_voice_galleries';
  info: {
    displayName: 'UserVoiceGallery';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    buttonUrl: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.gallery-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsGalleryItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_gallery_items';
  info: {
    displayName: 'GalleryItem';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    linkUrl: Schema.Attribute.String;
    showIcon: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface ElementsNavLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_nav_links';
  info: {
    displayName: 'Nav Link';
  };
  attributes: {
    filterTag: Schema.Attribute.String;
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface ElementsNavPromo extends Struct.ComponentSchema {
  collectionName: 'components_elements_nav_promos';
  info: {
    displayName: 'Nav Promo';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    linkUrl: Schema.Attribute.String;
  };
}

export interface ElementsProductHandles extends Struct.ComponentSchema {
  collectionName: 'components_elements_product_handles';
  info: {
    displayName: 'productHandles';
  };
  attributes: {
    handle: Schema.Attribute.String;
  };
}

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    copyrightText: Schema.Attribute.String;
    footerColumns: Schema.Attribute.Component<'blocks.nav-column', true>;
    legalLinks: Schema.Attribute.Component<'elements.nav-link', true>;
    logoImage: Schema.Attribute.Media<'images'>;
    socialLinks: Schema.Attribute.Component<'elements.nav-link', true>;
  };
}

export interface LayoutHeader extends Struct.ComponentSchema {
  collectionName: 'components_layout_headers';
  info: {
    displayName: 'Header';
  };
  attributes: {
    announcementBar: Schema.Attribute.String;
    logo: Schema.Attribute.Media<'images'>;
    navItems: Schema.Attribute.Component<'menu.nav-items', true>;
  };
}

export interface MenuNavItems extends Struct.ComponentSchema {
  collectionName: 'components_menu_nav_items';
  info: {
    displayName: 'navItems';
  };
  attributes: {
    hasMegamenu: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    megaMenu: Schema.Attribute.Component<'menu.nav-megamenu', false>;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface MenuNavMegamenu extends Struct.ComponentSchema {
  collectionName: 'components_menu_nav_megamenus';
  info: {
    displayName: 'Nav Megamenu';
  };
  attributes: {
    columns: Schema.Attribute.Component<'blocks.nav-column', true>;
    promo: Schema.Attribute.Component<'elements.nav-promo', false>;
    type: Schema.Attribute.Enumeration<['categories', 'stores']>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.benefits-section': BlocksBenefitsSection;
      'blocks.hero-section': BlocksHeroSection;
      'blocks.image-with-text': BlocksImageWithText;
      'blocks.journal-grid': BlocksJournalGrid;
      'blocks.listing-hero': BlocksListingHero;
      'blocks.nav-column': BlocksNavColumn;
      'blocks.product-carousel': BlocksProductCarousel;
      'blocks.promo-modal': BlocksPromoModal;
      'blocks.reviews-section': BlocksReviewsSection;
      'blocks.routine-widget': BlocksRoutineWidget;
      'blocks.text-over-image': BlocksTextOverImage;
      'blocks.text-statement': BlocksTextStatement;
      'blocks.user-voice-gallery': BlocksUserVoiceGallery;
      'elements.gallery-item': ElementsGalleryItem;
      'elements.nav-link': ElementsNavLink;
      'elements.nav-promo': ElementsNavPromo;
      'elements.product-handles': ElementsProductHandles;
      'layout.footer': LayoutFooter;
      'layout.header': LayoutHeader;
      'menu.nav-items': MenuNavItems;
      'menu.nav-megamenu': MenuNavMegamenu;
    }
  }
}
