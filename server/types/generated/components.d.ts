import type { Schema, Struct } from '@strapi/strapi';

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

export interface ElementsNavLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_nav_links';
  info: {
    displayName: 'Nav Link';
  };
  attributes: {
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
      'blocks.hero-section': BlocksHeroSection;
      'blocks.image-with-text': BlocksImageWithText;
      'blocks.nav-column': BlocksNavColumn;
      'blocks.product-carousel': BlocksProductCarousel;
      'blocks.text-over-image': BlocksTextOverImage;
      'elements.nav-link': ElementsNavLink;
      'elements.nav-promo': ElementsNavPromo;
      'elements.product-handles': ElementsProductHandles;
      'layout.header': LayoutHeader;
      'menu.nav-items': MenuNavItems;
      'menu.nav-megamenu': MenuNavMegamenu;
    }
  }
}
