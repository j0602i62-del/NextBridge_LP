/**
 * NextBridge Corporate Website - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile Drawer Navigation
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer .btn');

  const openMobileMenu = () => {
    mobileToggle?.classList.add('active');
    mobileDrawer?.classList.add('open');
    mobileOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileToggle?.classList.remove('active');
    mobileDrawer?.classList.remove('open');
    mobileOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  };

  mobileToggle?.addEventListener('click', () => {
    if (mobileDrawer?.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileOverlay?.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // 3. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');

  const activateElement = (el) => {
    el.classList.add('active');
  };

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    revealElements.forEach((el) => {
      // Check if element is already within viewport on initial load
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        activateElement(el);
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    // Fallback for older browsers
    revealElements.forEach((el) => activateElement(el));
  }

  // 4. Smooth Anchor Scrolling & Hash Handling
  const handleHashTarget = () => {
    const hash = window.location.hash;
    if (!hash) return;

    try {
      const target = document.querySelector(hash);
      if (target) {
        // Activate any reveal elements inside or on the target itself
        if (target.classList.contains('reveal')) {
          activateElement(target);
        }
        target.querySelectorAll('.reveal').forEach((el) => activateElement(el));

        // Smooth scroll with fixed header offset (80px)
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      }
    } catch (e) {
      // Ignore invalid selector in hash
    }
  };

  // Run on load after a brief frame to ensure layout is ready
  if (window.location.hash) {
    setTimeout(handleHashTarget, 100);
  }
  window.addEventListener('hashchange', handleHashTarget);

  // 5. Number Counter Animation for Stats
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const targetVal = parseFloat(el.getAttribute('data-target') || '0');
            const isDecimal = el.getAttribute('data-decimal') === 'true';
            const duration = 1600; // ms
            const startTime = performance.now();

            const updateCount = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const currentVal = easeProgress * targetVal;

              if (isDecimal) {
                el.textContent = currentVal.toFixed(1);
              } else {
                el.textContent = Math.floor(currentVal).toLocaleString();
              }

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                if (isDecimal) {
                  el.textContent = targetVal.toFixed(1);
                } else {
                  el.textContent = targetVal.toLocaleString();
                }
              }
            };

            requestAnimationFrame(updateCount);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.25 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  // 6. FAQ Accordion (for services.html)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        if (answer) answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
        }
      }
    });
  });

  // 7. Contact Form Query Parameter Prefill & Submission (for contact.html)
  const contactForm = document.getElementById('contactForm');
  const modalOverlay = document.getElementById('contactModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  if (contactForm) {
    // Parse URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    const productParam = urlParams.get('product');
    const jobParam = urlParams.get('job');

    const typeSelect = document.getElementById('contactType');
    const messageTextarea = document.getElementById('messageContent');

    if (typeSelect && typeParam) {
      const lowerType = typeParam.toLowerCase();
      if (lowerType === 'casual' || lowerType === 'recruit') {
        typeSelect.value = 'recruit';
      } else if (lowerType === 'demo' || lowerType === 'trial') {
        typeSelect.value = 'demo';
      } else if (['consultation', 'document', 'partner', 'other'].includes(lowerType)) {
        typeSelect.value = lowerType;
      }
    }

    if (messageTextarea) {
      const prefillLines = [];

      if (productParam) {
        const lowerProd = productParam.toLowerCase();
        let pName = productParam;
        if (lowerProd.includes('crm')) {
          pName = 'BridgeCRM（顧客管理プラットフォーム）';
        } else if (lowerProd.includes('flow')) {
          pName = 'BridgeFlow（業務プロセス最適化ツール）';
        } else if (lowerProd.includes('analytics')) {
          pName = 'BridgeAnalytics（BIデータ分析ダッシュボード）';
        }
        prefillLines.push(`【ご検討プロダクト】${pName}`);
      }

      if (jobParam) {
        const lowerJob = jobParam.toLowerCase();
        let jName = jobParam;
        if (lowerJob.includes('front')) {
          jName = 'フロントエンドエンジニア';
        } else if (lowerJob.includes('back')) {
          jName = 'バックエンドエンジニア';
        } else if (lowerJob.includes('cs')) {
          jName = 'カスタマーサクセス（CS）';
        } else if (lowerJob.includes('design')) {
          jName = 'UI/UXデザイナー';
        }
        prefillLines.push(`【応募希望職種】${jName}`);
      }

      if (typeParam) {
        const lowerType = typeParam.toLowerCase();
        if (lowerType === 'casual') {
          prefillLines.push('【ご希望】まずはカジュアル面談でチームや業務内容についてお伺いしたく存じます。');
        } else if (lowerType === 'demo' || lowerType === 'trial') {
          prefillLines.push('【ご希望】14日間の無料トライアル及び製品デモを希望いたします。');
        } else if (lowerType === 'document') {
          prefillLines.push('【ご希望】製品サービス資料のご送付を希望いたします。');
        }
      }

      if (prefillLines.length > 0 && !messageTextarea.value) {
        messageTextarea.value = prefillLines.join('\n') + '\n\n';
      }
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '送信する';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px; margin-right: 8px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke="rgba(255,255,255,0.3)"></circle>
            <path stroke-linecap="round" stroke-width="4" stroke="currentColor" d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          送信中...
        `;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        if (modalOverlay) {
          modalOverlay.classList.add('open');
          document.body.style.overflow = 'hidden';
        }

        contactForm.reset();
      }, 900);
    });
  }

  const closeModal = () => {
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  modalCloseBtn?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
});
