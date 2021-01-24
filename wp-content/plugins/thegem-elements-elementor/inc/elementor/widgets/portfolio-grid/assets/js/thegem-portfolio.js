(function($) {
	$(function() {

		window.defaultSortPortfolioData = {
			date: '[data-sort-date] parseInt',
			title: '.title'
		};

		function portfolio_images_loaded($box, image_selector, callback) {
			function check_image_loaded(img) {
				return img.complete && img.naturalWidth !== undefined && img.naturalWidth != 0;
			}

			var $images = $(image_selector, $box).filter(function() {
					return !check_image_loaded(this);
				}),
				images_count = $images.length;

			if (images_count == 0) {
				return callback();
			}

			if (window.gemBrowser.name == 'ie' && !isNaN(parseInt(window.gemBrowser.version)) && parseInt(window.gemBrowser.version) <= 10) {
				function image_load_event() {
					images_count--;
					if (images_count == 0) {
						callback();
					}
				}

				$images.each(function() {
					if (check_image_loaded(this)) {
						return;
					}

					var proxyImage = new Image();
					proxyImage.addEventListener( 'load', image_load_event );
					proxyImage.addEventListener( 'error', image_load_event );
					proxyImage.src = this.src;
				});
				return;
			}

			$images.on('load error', function() {
				images_count--;
				if (images_count == 0) {
					callback();
				}
			});
		}

		function init_prev_next_navigator_buttons ($portfolio) {
			var current_page = $portfolio.data('current-page');
			var pages_count = $portfolio.data('pages-count');
			if (current_page <= 1)
				$('.portfolio-navigator a.prev', $portfolio).css('display', 'none');
			else
				$('.portfolio-navigator a.prev', $portfolio).css('display', 'block');

			if (current_page >= pages_count)
				$('.portfolio-navigator a.next', $portfolio).css('display', 'none');
			else
				$('.portfolio-navigator a.next', $portfolio).css('display', 'block');
		}

		function get_portfolio_sorted_items($portfolio, $activeItems) {
			if (!$('.portfolio-sorting a.sorting-switcher', $portfolio).length) {
				return $activeItems;
			}

			var sortOptions = get_portfolio_sorting_data($portfolio);
			var sortBy = window.defaultSortPortfolioData[ sortOptions.sortBy ];

			var isParseInt = false;
			if (sortBy.indexOf('parseInt') != -1) {
				sortBy = sortBy.replace(' parseInt', '');
				var isParseInt = true;
			}

			var isSortByAttr = false;
			var m = sortBy.match( /^\[(.+)\]$/ );
			if (m) {
				sortBy = m[1];
				var isSortByAttr = true;
			}

			$activeItems.sort(function($item1, $item2) {
				if (isSortByAttr) {
					var item1_value = $item1.getAttribute( sortBy );
					var item2_value = $item2.getAttribute( sortBy );
				} else {
					var item1_value = $(sortBy, $item1).text();
					var item2_value = $(sortBy, $item2).text();
				}

				if (isParseInt) {
					item1_value = parseInt(item1_value);
					item2_value = parseInt(item2_value);
				}

				return ( item1_value > item2_value ? 1 : -1 ) * ( sortOptions.sortAscending ? 1 : -1 );
			});
			return $activeItems;
		}

		function init_portfolio_pages($portfolio) {
			var activeFilter = $portfolio.data('portfolio-filter') || '*';
			if (activeFilter != '*') {
				activeFilter = '.' + activeFilter;
			}

			var $activeItems = $('.portfolio-set .portfolio-item', $portfolio);
			if (activeFilter != '*') {
				$activeItems = $activeItems.filter(activeFilter);
			}

			var count = $activeItems.length;
			var default_per_page = $portfolio.data('per-page') || count;
			if (default_per_page == -1 ) {
				default_per_page = count;
			}

			if ($('.portfolio-count select', $portfolio).length)
				var per_page = $('.portfolio-count select', $portfolio).val();
			else
				var per_page = default_per_page;

			var pages_count = Math.ceil(count / per_page);
			var current_page = 1;

			$portfolio.data('per-page', per_page);
			$portfolio.data('pages-count', pages_count);
			$portfolio.data('current-page', current_page);

			if ($('.portfolio-navigator', $portfolio).length && pages_count > 1) {
				var pagenavigator = '';
				for (var i = 0; i < pages_count; i++)
					pagenavigator += '<a href="#" data-page="' + (i + 1) + '">' + (i + 1) + '</a>';
				$('.portfolio-navigator', $portfolio).find('.pages').html(pagenavigator );
				$('.portfolio-navigator', $portfolio).show();
				$('.portfolio-set', $portfolio).css('margin-bottom', '');
				$('.portfolio-navigator a[data-page="' + current_page + '"]', $portfolio).addClass('current')
				init_prev_next_navigator_buttons($portfolio);
			} else {
				$('.portfolio-navigator', $portfolio).html('').hide();
				$('.portfolio-set', $portfolio).css('margin-bottom', 0);
			}

			$('.portfolio-set .portfolio-item', $portfolio).removeClass(function(index, class_name) {
				return  (class_name.match (/\bpaginator-page-\S+/g) || []).join(' ');
			});

			$('.portfolio-set .portfolio-item', $portfolio).removeClass('item-even');

			var sorted_items = get_portfolio_sorted_items($portfolio, $activeItems);
			$.each(sorted_items, function(i, item) {
				var page = Math.ceil((i + 1) / per_page);
				$(item).addClass('paginator-page-' + page);
				if(i % 2 != 0){
					$(item).addClass('item-even');
				}
			});

			$('.portfolio-navigator', $portfolio).on('click', 'a', function() {
				if ($(this).hasClass('current'))
					return false;
				var current_page = $(this).parents('.portfolio-navigator ').find('.current:first').data('page');
				if ($(this).hasClass('prev')) {
					var page = current_page - 1;
				} else if ($(this).hasClass('next')) {
					var page = current_page + 1
				} else {
					var page = $(this).data('page');
				}
				if (page < 1)
					page = 1;
				if (page > pages_count)
					page = pages_count;
				$(this).parents('.portfolio-navigator ').find('a').removeClass('current');
				$(this).parents('.portfolio-navigator ').find('a[data-page="' + page + '"]').addClass('current');
				$portfolio.data('current-page', page);
				init_prev_next_navigator_buttons($portfolio);
				$portfolio.itemsAnimations('instance').reinitItems($('.portfolio-set .portfolio-item', $portfolio));
				$('.portfolio-set', $portfolio).isotope({ filter: '.paginator-page-' + page });
				$("html, body").animate({ scrollTop: $portfolio.offset().top - 200 }, 600);
				return false;
			});
		}

		function init_portfolio_count($portfolio) {
			if (!$('.portfolio-count select', $portfolio).length) {
				return false;
			}
			$('.portfolio-count select', $portfolio).on('change', function() {
				init_portfolio_pages($portfolio);
				$portfolio.itemsAnimations('instance').reinitItems($('.portfolio-set .portfolio-item', $portfolio));
				var current_page = $portfolio.data('current-page');
				$('.portfolio-set', $portfolio).isotope({
					filter: '.paginator-page-' + current_page
				});
			});
		}

		function get_portfolio_sorting_data($portfolio) {
			var sorting = {
				sortBy: $('.portfolio-sorting .orderby .sorting-switcher', $portfolio).data('current'),
				sortAscending: $('.portfolio-sorting .order .sorting-switcher', $portfolio).data('current') == 'ASC'
			};

			return sorting;
		}

		function init_portfolio_sorting($portfolio) {
			if (!$('.portfolio-sorting a.sorting-switcher', $portfolio).length)
				return false;

			$('.portfolio-sorting a.sorting-switcher', $portfolio).on('click', function(e) {
				var $selected = $('label[data-value!="' + $(this).data('current') + '"]', $(this).parent());
				$(this).data('current', $selected.data('value'));

				if($(this).next().is($selected)) {
					$(this).addClass('right');
				} else {
					$(this).removeClass('right');
				}

				if ($portfolio.hasClass('portfolio-pagination-scroll')) {
					$portfolio.data('next-page', 1);
					portfolio_scroll_load_next_request($portfolio);

				} else if (!$('.portfolio-load-more', $portfolio).length) {
					init_portfolio_pages($portfolio);
					var current_page = $portfolio.data('current-page'),
						sortOptions = get_portfolio_sorting_data($portfolio);

					$portfolio.itemsAnimations('instance').reinitItems($('.portfolio-set .portfolio-item', $portfolio));
					$('.portfolio-set', $portfolio).isotope({
						filter: '.paginator-page-' + current_page,
						sortBy: sortOptions.sortBy,
						sortAscending: sortOptions.sortAscending
					});
				} else {
					$portfolio.data('next-page', 1);
					portfolio_load_core_request($portfolio);
				}

				e.preventDefault();
				return false;
			});

			$('.portfolio-sorting label', $portfolio).on('click', function(e) {
				if($(this).data('value') != $('.sorting-switcher', $(this).parent()).data('current')) {
					$('.sorting-switcher', $(this).parent()).click();
				}
				e.preventDefault();
				return false;
			});
		}

		function portfolio_load_core_request($portfolio) {
			var $set = $('.portfolio-set', $portfolio);
			var uid = $portfolio.data('portfolio-uid');
			var is_processing_request = $set.data('request-process') || false;
			if (is_processing_request)
				return false;
			$set.data('request-process', true);
			var data = $.extend(true, {}, window['thegem_portfolio_ajax_' + uid]);
			if ($.isEmptyObject(data)) {
				data = $.extend(true, {}, window['thegem_portfolio_ajax']);
				data['data'] = { ...widget_settings[uid] };
				data['action'] = data['data']['action'];
			}

			if ($('.portfolio-count select', $portfolio).size() > 0)
				data['data']['more_count'] = $('.portfolio-count select', $portfolio).val();
			data['data']['more_page'] = $portfolio.data('next-page') || 1;
			if (data['data']['more_page'] == 0)
				return false;

			if ($portfolio.data('portfolio-filter')) {
				if ($portfolio.hasClass('news-grid')) {
					data['data']['categories'] = [$portfolio.data('portfolio-filter')];
				} else if ($portfolio.hasClass('products')) {
					data['data']['content_products_cat'] = [$portfolio.data('portfolio-filter')];
				} else {
					data['data']['content_portfolios_cat'] = [$portfolio.data('portfolio-filter')];
				}
			}

			if ($('.portfolio-sorting', $portfolio).length > 0) {
				data['data']['orderby'] = $('.portfolio-sorting .orderby .sorting-switcher', $portfolio).data('current');
				data['data']['order'] = $('.portfolio-sorting .order .sorting-switcher', $portfolio).data('current');
			} else {
				if ($portfolio.hasClass('news-grid')) {
					data['data']['orderby'] = 'menu_order date';
					data['data']['order'] = 'DESC';
				} else {
					data['data']['orderby'] = 'menu_order ID';
					data['data']['order'] = 'ASC';
				}
			}

			$('.portfolio-load-more .gem-button', $portfolio).before('<div class="loading"><div class="preloader-spin"></div></div>');
			data['data'] = JSON.stringify(data['data']);
			$.ajax({
				type: 'post',
				dataType: 'json',
				url: data.url,
				data: data,
				success: function(response) {
					if (response.status == 'success') {
						var minZIndex = $('.portfolio-item:last', $set).css('z-index') - 1;
						var $newItems = $(response.html);
						if ($newItems.hasClass('woocommerce')) {
							$newItems = $newItems.find('>div');
						}
						$('.portfolio-item', $newItems).addClass('paginator-page-1');
						$('.portfolio-item', $newItems).each(function() {
							$(this).css('z-index', minZIndex--);
						});
						var current_page = $newItems.data('page');
						var next_page = $newItems.data('next-page');
						var $inserted_data = $($newItems.html());
						if ($portfolio.itemsAnimations('instance').getAnimationName() != 'disabled') {
							$inserted_data.addClass('item-animations-not-inited');
						} else {
							$inserted_data.removeClass('item-animations-not-inited');
						}

						if (($portfolio.hasClass('columns-2') || $portfolio.hasClass('columns-3') || $portfolio.hasClass('columns-4')) && $portfolio.outerWidth() > 1170) {
							$('.image-inner picture source', $inserted_data).remove();
						}
						portfolio_images_loaded($newItems, '.image-inner img', function() {
							if (current_page == 1) {
								$portfolio.itemsAnimations('instance').clear();
								$set.html('');
								$set.isotope('reloadItems');
							}

							$set.isotope('insert', $inserted_data);
							init_circular_overlay($portfolio, $set);
							$portfolio.itemsAnimations('instance').show($inserted_data);

							if (window.wp !== undefined && window.wp.mediaelement !== undefined) {
								window.wp.mediaelement.initialize();
							}

							$('.portfolio-load-more .loading', $portfolio).remove();
							$portfolio.data('next-page', next_page);
							if (next_page > 0) {
								$('.portfolio-load-more', $portfolio).show();
							} else {
								$('.portfolio-load-more', $portfolio).hide();
							}

							$portfolio.initPortfolioFancybox();
							$set.data('request-process', false);
							customIcons($portfolio);
						});

					} else {
						alert(response.message);
						$('.portfolio-load-more .gem-button .loading', $portfolio).remove();
					}
				}
			});
		}

		function init_portfolio_more_count($portfolio) {
			if ($('.portfolio-count select', $portfolio).size() == 0)
				return false;
			$('.portfolio-count select', $portfolio).on('change', function() {
				$portfolio.data('next-page', 1);
				portfolio_load_core_request($portfolio);
			});
		}

		function init_portfolio_scroll_next_count($portfolio) {
			if ($('.portfolio-count select', $portfolio).size() == 0)
				return false;
			$('.portfolio-count select', $portfolio).on('change', function() {
				$portfolio.data('next-page', 1);
				portfolio_scroll_load_next_request($portfolio);
			});
		}

		function portfolio_scroll_load_next_request($portfolio) {
			var $set = $('.portfolio-set', $portfolio);
			var uid = $portfolio.data('portfolio-uid');
			var is_processing_request = $set.data('request-process') || false;
			if (is_processing_request)
				return false;
			var data = $.extend(true, {}, window['thegem_portfolio_ajax_' + uid]);
			if ($.isEmptyObject(data)) {
				data = $.extend(true, {}, window['thegem_portfolio_ajax']);
				data['data'] = { ...widget_settings[uid] };
				data['action'] = data['data']['action'];
			}
			if ($('.portfolio-count select', $portfolio).size() > 0)
				data['data']['more_count'] = $('.portfolio-count select', $portfolio).val();

			data['data']['more_page'] = $portfolio.data('next-page');
			if (data['data']['more_page'] == null || data['data']['more_page'] == undefined) {
				data['data']['more_page'] = 1;
			}
			if (data['data']['more_page'] == 0)
				return false;

			if ($portfolio.data('portfolio-filter')) {
				if ($portfolio.hasClass('news-grid')) {
					data['data']['categories'] = [$portfolio.data('portfolio-filter')];
				} else if ($portfolio.hasClass('products')) {
					data['data']['content_products_cat'] = [$portfolio.data('portfolio-filter')];
				} else {
					data['data']['content_portfolios_cat'] = [$portfolio.data('portfolio-filter')];
				}
			}

			if ($('.portfolio-sorting', $portfolio).length > 0) {
				data['data']['orderby'] = $('.portfolio-sorting .orderby .sorting-switcher', $portfolio).data('current');
				data['data']['order'] = $('.portfolio-sorting .order .sorting-switcher', $portfolio).data('current');
			} else {
				if ($portfolio.hasClass('news-grid')) {
					data['data']['orderby'] = 'menu_order date';
					data['data']['order'] = 'DESC';
				} else {
					data['data']['orderby'] = 'menu_order ID';
					data['data']['order'] = 'ASC';
				}
			}

			$set.data('request-process', true);
			$('.portfolio-scroll-pagination', $portfolio).addClass('active').html('<div class="loading"><div class="preloader-spin"></div></div>');

			data['data'] = JSON.stringify(data['data']);
			$.ajax({
				type: 'post',
				dataType: 'json',
				url: data.url,
				data: data,
				success: function(response) {
					if (response.status == 'success') {
						var minZIndex = $('.portfolio-item:last', $set).css('z-index') - 1;
						var $newItems = $(response.html);
						if ($newItems.hasClass('woocommerce')) {
							$newItems = $newItems.find('>div');
						}
						$('.portfolio-item', $newItems).addClass('paginator-page-1');
						$('.portfolio-item', $newItems).each(function() {
							$(this).css('z-index', minZIndex--);
						});
						var current_page = $newItems.data('page');
						var next_page = $newItems.data('next-page');
						var $inserted_data = $($newItems.html());
						if ($portfolio.itemsAnimations('instance').getAnimationName() != 'disabled') {
							$inserted_data.addClass('item-animations-not-inited');
						} else {
							$inserted_data.removeClass('item-animations-not-inited');
						}
						if (($portfolio.hasClass('columns-2') || $portfolio.hasClass('columns-3') || $portfolio.hasClass('columns-4')) && $portfolio.outerWidth() > 1170) {
							$('.image-inner picture source', $inserted_data).remove();
						}
						portfolio_images_loaded($newItems, '.image-inner img', function() {
							if (current_page == 1) {
								$portfolio.itemsAnimations('instance').clear();
								$set.html('');
							}

							$set.isotope('insert', $inserted_data);
							init_circular_overlay($portfolio, $set);
							$portfolio.itemsAnimations('instance').show($inserted_data);

							if (window.wp !== undefined && window.wp.mediaelement !== undefined) {
								window.wp.mediaelement.initialize();
							}

							$('.portfolio-scroll-pagination', $portfolio).removeClass('active').html('');
							$portfolio.data('next-page', next_page);
							$set.data('request-process', false);
							$portfolio.initPortfolioFancybox();
							customIcons($portfolio);
						});
					} else {
						alert(response.message);
						$('.portfolio-scroll-pagination', $portfolio).removeClass('active').html('');
					}
				}
			});
		}

		function init_portfolio_scroll_next_page($portfolio) {
			if ($('.portfolio-scroll-pagination', $portfolio).length == 0) {
				return false;
			}

			var $pagination = $('.portfolio-scroll-pagination', $portfolio);
			var watcher = scrollMonitor.create($pagination[0]);
			watcher.enterViewport(function() {
				portfolio_scroll_load_next_request($portfolio);
			});
		}

		$('.portfolio-count select').combobox();

		function init_circular_overlay($portfolio, $set) {
			if (!$portfolio.hasClass('hover-circular') && !$portfolio.hasClass('hover-new-circular') && !$portfolio.hasClass('hover-default-circular')) {
				return;
			}

			$('.portfolio-item', $set).on('mouseenter', function() {
				var overlayWidth = $('.overlay', this).width(),
					overlayHeight = $('.overlay', this).height(),
					$overlayCircle = $('.overlay-circle', this),
					maxSize = 0;

				if (overlayWidth > overlayHeight) {
					maxSize = overlayWidth;
					$overlayCircle.height(overlayWidth)
				} else {
					maxSize = overlayHeight;
					$overlayCircle.width(overlayHeight);
				}
				maxSize += overlayWidth * 0.3;

				$overlayCircle.css({
					marginLeft: -maxSize / 2,
					marginTop: -maxSize / 2
				});
			});
		}

		function fixItemHiddenContent(items) {
			items.forEach(function(item) {
				var $hiddenContent = $('.slide-content-hidden', item.element);

				if (!$hiddenContent.length) {
					return;
				}

				$hiddenContent.css('margin-bottom', -$hiddenContent.outerHeight() + 'px');
			});
		}

		function fixHorizontalSlidingAuthor(items) {
			items.forEach(function(item) {
				var $visibleContent = $('.slide-content-visible', item.element),
					$hiddenContent = $('.slide-content-hidden', item.element),
					$authorContent = $('.caption .author', item.element);

				if (!$authorContent.length || !$visibleContent.length || !$hiddenContent.length) {
					return;
				}

				$authorContent.css('top', ($visibleContent.outerHeight() - $hiddenContent.outerHeight() - $authorContent.outerHeight()) + 'px');
			});
		}

		function initNewsGridItems($portfolio) {
			if (!$portfolio.hasClass('news-grid')) {
				return;
			}

			if (!$portfolio.hasClass('title-on-page')) {
				$('.portfolio-item', $portfolio).each(function() {
					var $item = $(this);

					if ($item.width() < 260 || $item.height() < 300) {
						$item.addClass('small-item');
					}
				});
			}

			if (typeof $.fn.buildSimpleGalleries === 'function') {
				$portfolio.buildSimpleGalleries();
			}

			if (typeof $.fn.updateSimpleGalleries === 'function') {
				$portfolio.updateSimpleGalleries();
			}
		}

		function filterPortfolio($portfolio, filterValue) {
			$portfolio.data('portfolio-filter', filterValue || '');

			if (!$('.portfolio-load-more', $portfolio).length && !$portfolio.hasClass('portfolio-pagination-scroll')) {
				init_portfolio_pages($portfolio);

				filterValue = filterValue == '' ? '*' : '.' + filterValue;
				filterValue += '.paginator-page-' + $portfolio.data('current-page');

				$portfolio.itemsAnimations('instance').reinitItems($('.portfolio-set .portfolio-item', $portfolio));
				$('.portfolio-set', $portfolio).isotope({
					filter: filterValue
				});
			} else {
				$portfolio.data('next-page', 1);

				if ($portfolio.hasClass('portfolio-pagination-scroll')) {
					portfolio_scroll_load_next_request($portfolio);
				} else {
					portfolio_load_core_request($portfolio);
				}
			}
		}

		function hasOnlyDoubleItems($set) {
			var $items = $('.portfolio-item', $set);
			return $items.length == $items.filter('.double-item-squared, .double-item-horizontal').length;
		}

		function fixPortfolioWithDoubleItems($portfolio, needFix) {
			if (needFix) {
				$portfolio.addClass('porfolio-even-columns');
			} else {
				$portfolio.removeClass('porfolio-even-columns');
			}
		}

		function initPortfolioGrid() {
			if (window.tgpLazyItems !== undefined) {
				var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
					initPortfolioGrid.call(node);
				});
				if (!isShowed) {
					return;
				}
			}

			var $portfolio = $(this);
			var $set = $('.portfolio-set', this);
			var isNewsGrid = $portfolio.hasClass('news-grid');

			if ($portfolio.hasClass('portfolio-pagination-scroll')) {
				var current_page = 1;
				$('.portfolio-set .portfolio-item', $portfolio).addClass('paginator-page-1');
				init_portfolio_sorting($portfolio);
				init_portfolio_scroll_next_count($portfolio);

			} else if ($('.portfolio-load-more', $portfolio).size() == 0) {
				init_portfolio_count($portfolio);
				init_portfolio_sorting($portfolio);
				init_portfolio_pages($portfolio);
				var current_page = $portfolio.data('current-page');
			} else {
				var current_page = 1;
				$('.portfolio-set .portfolio-item', $portfolio).addClass('paginator-page-1');
				init_portfolio_sorting($portfolio);
				init_portfolio_more_count($portfolio);
			}

			if (($portfolio.hasClass('columns-2') || $portfolio.hasClass('columns-3') || $portfolio.hasClass('columns-4')) && $portfolio.outerWidth() > 1170) {
				$('.image-inner picture source', $set).remove();
			}

			portfolio_images_loaded($set, '.image-inner img', function() {
				var sortOptions = get_portfolio_sorting_data($portfolio);
				var layoutMode = 'masonry-custom';
				var portfolioStyle = 'justified';
				var titleOnPage = $portfolio.hasClass('title-on-page');

				if ($portfolio.hasClass('portfolio-style-masonry')) {
					portfolioStyle = 'masonry';
				}

				if ($portfolio.hasClass('portfolio-style-metro')) {
					layoutMode = 'metro';
					portfolioStyle = 'metro';
				}

				var itemsAnimations = $portfolio.itemsAnimations({
					itemSelector: '.portfolio-item',
					scrollMonitor: true
				});

				init_circular_overlay($portfolio, $set);

				initNewsGridItems($portfolio);

				if (portfolioStyle != 'metro') {
					fixPortfolioWithDoubleItems($portfolio, hasOnlyDoubleItems($set));
				}

				var size_container = $('.portfolio-item-size-container .portfolio-item', $portfolio);
				var isotope_options = {
					gridType: isNewsGrid ? 'news' : 'portfolio',
					itemSelector: '.portfolio-item',
					layoutMode: layoutMode,
					itemImageWrapperSelector: '.image-inner',
					fixHeightDoubleItems: portfolioStyle == 'justified',
					fixCaption: isNewsGrid && portfolioStyle == 'justified' && titleOnPage,
					'masonry-custom': {
						columnWidth: (size_container.length > 0) ? size_container[0] : '.portfolio-item:not(.double-item)'
					},
					filter: '.paginator-page-' + current_page,
					transitionDuration: 0
				};

				if ($('.portfolio-load-more', $portfolio).size() == 0 && !$portfolio.hasClass('portfolio-pagination-scroll')) {
					isotope_options['getSortData'] = window.defaultSortPortfolioData;
					isotope_options['sortBy'] = sortOptions.sortBy;
					isotope_options['sortAscending'] = sortOptions.sortAscending;
				}

				var init_portfolio = true;

				customIcons($portfolio);

				$portfolio.closest('.portfolio-preloader-wrapper').prev('.preloader').remove();

				$set
					.on( 'layoutComplete', function( event, laidOutItems ) {
						if ($portfolio.hasClass('products')) {
							var setWidth = $set[0].offsetWidth;

							for (var i = 0; i < laidOutItems.length; i++) {
								var item = laidOutItems[i],
									itemWrapWidth = item.element.querySelector('.wrap').offsetWidth,
									itemPadding = parseFloat($(item.element).css('padding-left'));

								if (isNaN(itemPadding)) {
									itemPadding = 0;
								}

								if ($portfolio.hasClass('hover-title') && $portfolio.hasClass('item-separator')) {
									item.element.style.zIndex = laidOutItems.length - i;
								}

								if (item.position.x === 0) {
									item.element.classList.add('left-item');
								} else {
									item.element.classList.remove('left-item');
								}

								if (item.position.y === 0) {
									item.element.classList.add('top-item');
								} else {
									item.element.classList.remove('top-item');
								}

								if (item.position.x + itemWrapWidth + 2 * itemPadding > setWidth - 4) {
									item.element.classList.add('right-item');
								} else {
									item.element.classList.remove('right-item');
								}

								if (itemWrapWidth < 320) {
									item.element.classList.add('item-small-size');
								} else {
									item.element.classList.remove('item-small-size');
								}
							}
						}

						if (isNewsGrid) {
							var setWidth = $set[0].offsetWidth;

							for (var i = 0; i < laidOutItems.length; i++) {
								var item = laidOutItems[i];

								if (item.element.classList.contains('double-item-style-alternative')) {
									var itemWidth = item.element.offsetWidth;

									if (item.position.x != 0 && item.position.x + itemWidth > setWidth - 4) {
										item.element.classList.add('right-item');
									} else {
										item.element.classList.remove('right-item');
									}
								}
							}

							if ($portfolio.hasClass('version-new')) {
								if ($portfolio.hasClass('hover-new-default') || $portfolio.hasClass('hover-new-zooming-blur')) {
									fixItemHiddenContent(laidOutItems);
								}

								if ($portfolio.hasClass('hover-new-horizontal-sliding')) {
									fixHorizontalSlidingAuthor(laidOutItems);
								}
							}
						}
					})
					.on( 'arrangeComplete', function( event, filteredItems ) {
						if ($portfolio.hasClass('products')) {
							if ($portfolio.hasClass('columns-1') && $portfolio.hasClass('caption-position-zigzag')) {
								$('.portfolio-item .image', $portfolio).removeClass('col-md-push-4 col-md-push-5');
								$('.portfolio-item .caption', $portfolio).removeClass('col-md-pull-8 col-md-pull-7');

								for (var i = 0; i < filteredItems.length; i++) {
									if (i % 2 == 1) {
										if ($(filteredItems[i].element).hasClass('portfolio-1x-fullwidth-item')) {
											$('.image', filteredItems[i].element).addClass('col-md-push-4');
											$('.caption', filteredItems[i].element).addClass('col-md-pull-8');
										} else {
											$('.image', filteredItems[i].element).addClass('col-md-push-5');
											$('.caption', filteredItems[i].element).addClass('col-md-pull-7');
										}
									}
								}
							}

							if ($portfolio.hasClass('title-on-hover') || $portfolio.hasClass('hover-gradient') || $portfolio.hasClass('hover-circular')) {
								$('.portfolio-item .portfolio-icons-inner > a:not(.added_to_cart)', $portfolio).addClass('icon');
							}
							$('.portfolio-item .product-bottom .yith-wcwl-wishlistexistsbrowse a', $portfolio).addClass('icon wishlist');
						}

						if ($set.closest('.fullwidth-block').size() > 0) {
							$set.closest('.fullwidth-block').bind('fullwidthUpdate', function() {
								if ($set.data('isotope')) {
									$set.isotope('layout');
									return false;
								}
							});
						} else {
							if ($set.closest('.vc_row[data-vc-stretch-content="true"]').length > 0) {
								$set.closest('.vc_row[data-vc-stretch-content="true"]').bind('VCRowFullwidthUpdate', function() {
									if ($set.data('isotope')) {
										$set.isotope('layout');
										return false;
									}
								});
							}
						}

						if (isNewsGrid) {
							var needLayout = false;

							filteredItems.forEach(function(item) {
								if (!titleOnPage) {
									if (item.size.innerWidth < 260 || item.size.innerHeight < 260) {
										if (!item.element.classList.contains('small-item')) {
											item.element.classList.add('small-item');
											needLayout = true;
										}
									} else {
										if (item.element.classList.contains('small-item')) {
											item.element.classList.remove('small-item');
											needLayout = true;
										}
									}
								}

								if ($('mediaelementwrapper', item.element).length > 0) {
									$('mediaelementwrapper', item.element).trigger('resize');
								}
							});

							if (typeof $.fn.buildSimpleGalleries === 'function') {
								$set.buildSimpleGalleries();
							}

							if (typeof $.fn.updateSimpleGalleries === 'function') {
								$set.updateSimpleGalleries();
							}

							if (needLayout && $set.data('isotope')) {
								$set.isotope('layout');
							}
						}

						if (portfolioStyle != 'metro') {
							var onlyDoubleItems = hasOnlyDoubleItems($set);

							if (onlyDoubleItems != $portfolio.hasClass('porfolio-even-columns')) {
								fixPortfolioWithDoubleItems($portfolio, onlyDoubleItems);

								if ($set.data('isotope')) {
									$set.isotope('layout');
								}
							}
						}

						if (init_portfolio) {
							var items = [];
							filteredItems.forEach(function(item) {
								items.push(item.element);
							});

							itemsAnimations.show($(items));
						}
					})
					.isotope(isotope_options);

				if (!window.gemSettings.lasyDisabled) {
					var elems = $('.portfolio-item:visible', $set);
					var items = [];
					for (var i = 0; i < elems.length; i++)
						items.push($set.isotope('getItem', elems[i]));
					$set.isotope('reveal', items);
				}

				if ($set.closest('.gem_tab').size() > 0) {
					$set.closest('.gem_tab').bind('tab-update', function() {
						if ($set.data('isotope')) {
							$set.isotope('layout');
						}
					});
				}

				if (isNewsGrid) {
					$($set).on('gallery-inited', '.gem-simple-gallery', function() {
						if ($set.data('isotope')) {
							$set.isotope('layout');
						}
					});
				}

				$(document).on('gem.show.vc.tabs', '[data-vc-accordion]', function() {
					var $tab = $(this).data('vc.accordion').getTarget();
					if($tab.find($set).length) {
						if ($set.data('isotope')) {
							$set.isotope('layout');
						}
					}
				});

				$(document).on('gem.show.vc.accordion', '[data-vc-accordion]', function() {
					var $tab = $(this).data('vc.accordion').getTarget();
					if($tab.find($set).length) {
						if ($set.data('isotope')) {
							$set.isotope('layout');
						}
					}
				});

				if ($('.portfolio-filters', $portfolio).length) {
					$('.portfolio-filters, .portfolio-filters-resp ul li', $portfolio).on('click', 'a', function() {
						var thisFilter = $(this).data('filter');

						$('.portfolio-filters a.active, .portfolio-filters-resp ul li a.active', $portfolio).removeClass('active');
						$('.portfolio-filters a[data-filter="' + thisFilter + '"], .portfolio-filters-resp ul li a[data-filter="' + thisFilter + '"]', $portfolio).addClass('active');

						filterPortfolio($portfolio, thisFilter.substr(1));

						if ($('.portfolio-filters-resp', $portfolio).size() > 0 && typeof $.fn.dlmenu === 'function') {
							$('.portfolio-filters-resp', $portfolio).dlmenu('closeMenu');
						}

						return false;
					});
				}

				$portfolio.on('click', '.info a:not(.zilla-likes)', function() {
					var slug = $(this).data('slug') || '';

					if ($('.portfolio-filters', $portfolio).length) {
						$('.portfolio-filters a[data-filter=".' + slug + '"]').click();
					} else {
						filterPortfolio($portfolio, slug);
					}

					return false;
				});

				$('.portfolio-load-more', $portfolio).on('click', function() {
					portfolio_load_core_request($portfolio);
				});

				if ($portfolio.hasClass('portfolio-pagination-scroll')) {
					init_portfolio_scroll_next_page($portfolio);
				}

				if (!$portfolio.hasClass('news-grid')) {
					$portfolio.on('click', '.portfolio-item .image .overlay, .portfolio-item .wrap > .caption', function(event) {
						var $target = $(event.target),
							$icons = $target.closest('.portfolio-item').find('.portfolio-icons');

						if ($target.closest('.icon').length || $target.closest('.socials-sharing').length || !$icons.length) {
							return;
						}

						if(window.gemSettings.isTouch) {
							if(!$target.closest('.portfolio-item').hasClass('touch-hover')) {
								$target.closest('.portfolio-item').addClass('touch-hover');
								$('*').one('click', function(event){
									if(!$(event.target).closest('.portfolio-item').is($target.closest('.portfolio-item'))) {
										$target.closest('.portfolio-item').removeClass('touch-hover');
									}
								});
								return false;
							}
						}

						if ($('.icon.self-link', $icons).length) {
							window.open(
								$('.icon.self-link', $icons).attr('href'),
								$('.icon.self-link', $icons).attr('target')
							);
						} else if ($('.icon.bottom-product-link', $icons).length) {
							window.open($('.icon.bottom-product-link', $icons).attr('href'), "_self");
						} else {
							var $firstIcon = $('.icon', $icons).first();

							if ($firstIcon.hasClass('inner-link') || $firstIcon.hasClass('outer-link')) {
								window.open(
									$firstIcon.attr('href'),
									$firstIcon.attr('target')
								);
							} else {
								$firstIcon.click();
							}
						}
					});
				}

				if (titleOnPage) {
					$(window).on('load', function() {
						if ($set.data('isotope')) {
							setTimeout(function() {
								$set.isotope('layout');
							}, 200);
						}
					});
				}
			});

			if (typeof $.fn.dlmenu === 'function') {
				$('.portfolio-filters-resp', $portfolio).dlmenu({
					animationClasses: {
						classin : 'dl-animate-in',
						classout : 'dl-animate-out'
					}
				});
			}
		}

		function toggleNewsGridSharing(button) {
			var $meta = $(button).closest('.grid-post-meta-inner'),
				$likes = $('.grid-post-meta-comments-likes', $meta),
				$icons = $('.portfolio-sharing-pane', $meta);

			if ($meta.hasClass('active')) {
				$meta.removeClass('active');

				$('.socials-sharing', $meta).animate({
					width: 'toggle'
				}, 300, function() {
					$meta.removeClass('animation');
				});
			} else {
				$meta.css('min-width', $meta.outerWidth());

				$meta.addClass('active animation');

				$('.socials-sharing', $meta).animate({
					width: 'toggle'
				}, 200);
			}
		}

		function customIcons($portfolio) {
			$portfolio.find('.post-meta-likes').each(function () {
				if ($(this).find('i').length) {
					if (!$(this).find('a').children('i').length) {
						var icon = $(this).children('i');
						$(this).find('a').prepend(icon.clone());
					}
				} else if ($(this).find('svg').length) {
					if (!$(this).find('a').children('svg').length) {
						var icon_svg = $(this).children('svg');
						$(this).find('a').prepend(icon_svg.clone());
					}
				}
			});

			$portfolio.find('.comments-link').each(function () {
				if ($(this).find('i').length) {
					var icon = $(this).find('i');
					$(this).find('i').remove();
					$(this).find('a').prepend(icon);
				} else if ($(this).find('svg').length) {
					var icon_svg = $(this).find('svg');
					$(this).find('svg').remove();
					$(this).find('a').prepend(icon_svg);
				}
			});

			$portfolio.find('.portfolio-likes').each(function () {
				if ($(this).find('i').length) {
					if (!$(this).find('a').children('i').length) {
						var icon = $(this).children('i');
						$(this).find('a').prepend(icon.clone());
					}
				} else if ($(this).find('svg').length) {
					if (!$(this).find('a').children('svg').length) {
						var icon_svg = $(this).children('svg');
						$(this).find('a').prepend(icon_svg.clone());
					}
				}
			});

			$portfolio.find('.portfolio-list-likes').each(function () {
				if ($(this).find('i').length) {
					if (!$(this).find('a').children('i').length) {
						var icon = $(this).children('i');
						$(this).find('a').prepend(icon.clone());
					}
				} else if ($(this).find('svg').length) {
					if (!$(this).find('a').children('svg').length) {
						var icon_svg = $(this).children('svg');
						$(this).find('a').prepend(icon_svg.clone());
					}
				}
			});

			$portfolio.find('.yith-icon').each(function () {
				if ($(this).find('i').length) {
					if (!$(this).find('a').children('i').length) {
						var icon = $(this).children('i');
						$(this).find('a').prepend(icon.clone());
					}
				} else if ($(this).find('svg').length) {
					if (!$(this).find('a').children('svg').length) {
						var icon_svg = $(this).children('svg');
						$(this).find('a').prepend(icon_svg.clone());
					}
				}
			});
		}

		$('body').on('DOMSubtreeModified', '.zilla-likes', function(){
			if (!$(this).children('i').length) {
				var icon = $(this).siblings('i');
				$(this).prepend(icon.clone());
			}
		});

		$('body').on('click', '.portfolio.portfolio-grid:not(.news-grid) a.icon.share', function (e) {
			e.preventDefault();
			$(this).closest('.links').find('.portfolio-sharing-pane').toggleClass('active');
			$(this).closest('.post-footer-sharing').find('.sharing-popup').toggleClass('active');
			return false;
		});

		$('body').on('click', '.portfolio.news-grid a.icon.share', function(e) {
			e.preventDefault();

			if ($(this).closest('.portfolio').hasClass('version-new') ||
				($(this).closest('.portfolio').hasClass('version-default') &&
					$(this).closest('.portfolio').hasClass('title-on-hover'))
			) {
				toggleNewsGridSharing(this);
			} else {
				$(this).closest('.links').find('.portfolio-sharing-pane').toggleClass('active');
			}
			return false;
		});

		$('body').on('mouseleave', '.portfolio.portfolio-grid .portfolio-item', function () {
			$('.portfolio-sharing-pane').removeClass('active');
		});

		$('body').on('click', '.portfolio.portfolio-grid .portfolio-item', function () {
			$(this).mouseover();
		});

		$.fn.initPortfoliosGrid = function () {
			$(this).each(initPortfolioGrid);
		};

		$(document).ready(function() {
			$('body:not(.elementor-editor-active) .portfolio-grid').initPortfoliosGrid();
		});

		setTimeout(function () {
			if ($('body:not(.elementor-editor-active) .preloader + .portfolio-preloader-wrapper').length) {
				$('.portfolio-grid').initPortfoliosGrid();
			}
		}, 2000);

	});
})(jQuery);