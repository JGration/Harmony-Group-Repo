<?php
if ( ! defined( 'ABSPATH' ) ) exit;

use Elementor\Icons_Manager;

$thegem_post_data = thegem_get_sanitize_page_title_data(get_the_ID());

$thegem_post_item_data = thegem_get_sanitize_post_data(get_the_ID());

$thegem_post_date = get_the_date("M Y");

$thegem_categories = get_the_category();
$thegem_categories_list = array();
foreach($thegem_categories as $thegem_category) {
	$thegem_categories_list[] = '<a href="'.esc_url(get_category_link( $thegem_category->term_id )).'" title="'.esc_attr( sprintf( __( "View all posts in %s", "thegem" ), $thegem_category->name ) ).'">'.$thegem_category->cat_name.'</a>';
}

$thegem_classes = array();

if(is_sticky() && !is_paged()) {
	$thegem_classes = array_merge($thegem_classes, array('sticky', 'default-background'));
}

$thegem_classes[] = 'item-animations-not-inited';

$has_content_gallery = get_post_format(get_the_ID()) == 'gallery';
$thegem_post_sources = array();
if (has_post_thumbnail() && !$has_content_gallery) {
	$thegem_post_sources = array(
		array('media' => '(max-width: 768px)', 'srcset' => array('1x' => 'thegem-blog-timeline-large', '2x' => 'thegem-blog-timeline-large')),
		array('media' => '(max-width: 1050px)', 'srcset' => array('1x' => 'thegem-blog-timeline-small', '2x' => 'thegem-blog-timeline-large')),
		array('media' => '(max-width: 1920px)', 'srcset' => array('1x' => 'thegem-blog-timeline', '2x' => 'thegem-blog-timeline-large')),
	);
}

$thegem_featured_content = thegem_get_post_featured_content(get_the_ID(), $has_content_gallery ? 'thegem-blog-timeline-large' : 'thegem-blog-default-large', false, $thegem_post_sources);

if ( !has_post_thumbnail() || !$settings['show_featured_image'] ){
	$thegem_classes[] = 'no-image';
}

if ( 'yes' !== ( $settings['show_title'] ) ) {
	$thegem_classes[] = 'no-title';	
}

?>

<article id="post-<?php the_ID(); ?>" <?php post_class($thegem_classes); ?> data-post-date="<?php echo esc_attr($thegem_post_date); ?>">
	<div class="item-post-container">

		<div class="post-timeline-elements">

			<div class="pointer">
				<div>
					<span class="date"><?php echo get_the_date('d M'); ?></span>
					<span class="time"><?php echo get_the_date('H:i'); ?></span>
				</div>
			</div>

			<div class="pointer-right">
				<div>
					<span class="date"><?php echo get_the_date('d M'); ?></span>
					<span class="time"><?php echo get_the_date('H:i'); ?></span>
				</div>
			</div>

			<?php if( $thegem_post_date != $last_post_date && $settings['show_date'] ): ?>
				<div class="timeline-date-title">
					<?php echo $thegem_post_date; ?>
				</div>
				<div class="timeline-date-title-right">
					<?php echo $thegem_post_date; ?>
				</div>
			<?php endif; ?>

		</div>

		<div class="post-item clearfix caption-container">

			<?php if( ! is_single() && is_sticky() ) {?>
				<div class="sticky-label">
					<div class="elementor-icon">
						<?php if ($settings['sticky_label_icon']['value']) {
							Icons_Manager::render_icon( $settings['sticky_label_icon'], [ 'aria-hidden' => 'true' ] );
						} else { ?>
							<i class="default"></i>
						<?php } ?>
					</div>
				</div>
			<?php } elseif (is_sticky() && is_admin()) {	?>
				<div class="sticky-label">
					<div class="elementor-icon">
						<?php if ($settings['sticky_label_icon']['value']) {
							Icons_Manager::render_icon( $settings['sticky_label_icon'], [ 'aria-hidden' => 'true' ] );
						} else { ?>
							<i class="default"></i>
						<?php } ?>
					</div>
				</div>
			<?php } ?>

			<?php if ( 'yes' === ( $settings['caption_container_bubbles_show'] ) ) : ?>
				<svg class="wrap-style"><path id="dec-post-arrow" d="M 50,0 Q 45,45 0,50 Q 45,55 50,100" /></svg>
				<svg class="wrap-style wrap-style-right"><path id="dec-post-arrow" d="M 50,0 Q 45,45 0,50 Q 45,55 50,100" /></svg>
			<?php endif; ?>

			<?php if ( $thegem_featured_content && $settings['show_featured_image'] ): ?>
				<div class="post-image post-pic"><?php echo $thegem_featured_content; ?></div>
			<?php endif; ?>

			<?php if ( get_post_format() != 'quote' || empty($thegem_featured_content) ) : ?>
				<div class="post-text-wrap">
					<div class="post-meta">
						<div class="entry-meta clearfix gem-post-date">

							<div class="post-meta-left">
								<?php if ( $settings['show_author'] ) : ?>
									<span class="post-meta-author"><?php printf( esc_attr( $settings['caption_author_by_text'] ) . esc_html__( " %s", "thegem" ), get_the_author_link() ) ?></span>
								<?php endif; ?>
							</div>

							<div class="post-meta-right">
								<?php  if ( comments_open() && $settings['show_comments'] ) : ?>
									<span class="comments-link"><div class="elementor-icon"><?php if ($settings['comments_icon']['value']) : Icons_Manager::render_icon( $settings['comments_icon'], [ 'aria-hidden' => 'true' ] ); else : ?><i class="default"></i> <?php endif; ?></div><?php comments_popup_link(0, 1, '%'); ?></span>
								<?php endif; ?>

								<?php if ( comments_open() && $settings['show_comments'] && function_exists('zilla_likes') && $settings['show_likes']): ?>
									<span class="sep"></span>
								<?php endif; ?>
								
								<?php if( function_exists( 'zilla_likes' ) && $settings['show_likes'] ) { echo '<span class="post-meta-likes">';if ($settings['likes_icon']['value']) :	Icons_Manager::render_icon($settings['likes_icon'], ['aria-hidden' => 'true']);	else: ?><i class="default"></i><?php endif;zilla_likes();echo '</span>'; } ?>
							</div>
						</div><!-- .entry-meta -->
					</div>

					<div class="post-title">
						<?php if ( 'yes' === ( $settings['show_title'] ) ) : ?>
							<?php the_title('<'.(is_sticky() && !is_paged() ? 'h2' : 'h3').' class="entry-title"><a href="' . esc_url(get_permalink()) . '" rel="bookmark">', '</a></'.(is_sticky() && !is_paged() ? 'h2' : 'h3').'>'); ?>
						<?php endif; ?>
					</div>

					<?php if ( 'yes' === ( $settings['show_description'] ) ) : ?>
						<div class="post-content">
							<div class="summary">
								<?php if ( !has_excerpt() && !empty( $thegem_post_data['title_excerpt'] ) ): ?>
									<?php echo $thegem_post_data['title_excerpt']; ?>
								<?php else: ?>
									<?php echo preg_replace('%&#x[a-fA-F0-9]+;%', '', apply_filters('the_excerpt', get_the_excerpt())); ?>
								<?php endif; ?>
							</div>
						</div>
					<?php endif; ?>

					<div class="post-misc">
						<div class="post-links">
							<div class="post-footer-sharing">
								<?php if ( $settings['show_social_sharing'] && ! empty( $bl_social_sharing ) && file_exists( $bl_social_sharing ) ) : include $bl_social_sharing; endif; ?>
							</div>
							<div class="post-read-more">
								<?php if ( $settings['show_readmore_button'] && ! empty( $bl_readmore_button ) && file_exists( $bl_readmore_button ) ) : include $bl_readmore_button; endif; ?>
							</div>
						</div>
					</div>

				</div>
			<?php endif; ?>
		</div>
	</div>
</article><!-- #post-<?php the_ID(); ?> -->