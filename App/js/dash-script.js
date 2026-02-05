document.addEventListener('DOMContentLoaded', function(){
      // Initialize chart
      if (document.getElementById('trendsChart')){
        const ctx = document.getElementById('trendsChart').getContext('2d');
        
        // Sample data for the chart
        const chartData ={
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Frontend Developer',
            data: [120, 150, 180, 170, 160, 200],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4
          },
         {
            label: 'Data Scientist',
            data: [100, 110, 130, 150, 170, 190],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          },
         {
            label: 'UX Designer',
            data: [80, 95, 110, 130, 150, 160],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4
          }]
        };
        
        const trendsChart = new Chart(ctx,{
          type: 'line',
          data: chartData,
          options:{
            responsive: true,
            maintainAspectRatio: false,
            scales:{
              y:{
                beginAtZero: false,
                grid:{
                  color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks:{
                  color: '#9ca3af'
                }
              },
              x:{
                grid:{
                  display: false
                },
                ticks:{
                  color: '#9ca3af'
                }
              }
            },
            plugins:{
              legend:{
                labels:{
                  color: '#9ca3af'
                }
              }
            }
          }
        });
      }

      // Card animations
      const cards = document.querySelectorAll('.bento-card');
      cards.forEach((card, index) =>{
        setTimeout(() =>{
          card.classList.add('visible');
        }, 100 * index);
      });

      // Collapse functionality
      document.querySelectorAll('.btn-collapse').forEach(button =>{
        button.addEventListener('click', () =>{
          const card = button.closest('.bento-card');
          if (!card) return;
          card.classList.toggle('card-collapsed');
          
          // Change icon based on state
          const icon = button.querySelector('i');
          if (!icon) return;
          if (card.classList.contains('card-collapsed')){
            icon.classList.replace('fa-minus', 'fa-plus');
          } else{
            icon.classList.replace('fa-plus', 'fa-minus');
          }
        });
      });


      // Glow effect on cards
      document.querySelectorAll('.bento-card').forEach(card =>{
        card.addEventListener('mousemove', (e) =>{
          const glowEffect = card.querySelector('.glow-effect');
          if (!glowEffect) return;
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          glowEffect.style.setProperty('--x', `${x}%`);
          glowEffect.style.setProperty('--y', `${y}%`);
        });
      });

      // Reset layout
      const resetLayoutButton = document.getElementById('reset-layout');
      if (resetLayoutButton){
        resetLayoutButton.addEventListener('click', () =>{
          // In a real implementation, this would reset the layout to default
          alert('Layout has been reset to default');
          localStorage.removeItem('dashboardLayout');
        });
      }

      // Resume file upload functionality
      const uploadArea = document.getElementById('resume-upload-area');
      const fileInput = document.getElementById('resume-file-input');
      
      if (uploadArea && fileInput){
        uploadArea.addEventListener('click', () =>{
          fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) =>{
          if (e.target.files.length > 0){
            const fileName = e.target.files[0].name;
            alert(`File "${fileName}" uploaded successfully! AI analysis will be ready shortly.`);
          }
        });
        
        // Drag and drop functionality
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName =>{
          uploadArea.addEventListener(eventName, (e) =>{
            e.preventDefault();
            e.stopPropagation();
          });
        });
        
        ['dragenter', 'dragover'].forEach(eventName =>{
          uploadArea.addEventListener(eventName, () =>{
            uploadArea.classList.add('border-purple-500');
            uploadArea.classList.add('bg-opacity-10');
            uploadArea.classList.add('bg-purple-900');
          });
        });
        
        ['dragleave', 'drop'].forEach(eventName =>{
          uploadArea.addEventListener(eventName, () =>{
            uploadArea.classList.remove('border-purple-500');
            uploadArea.classList.remove('bg-opacity-10');
            uploadArea.classList.remove('bg-purple-900');
          });
        });
        
        uploadArea.addEventListener('drop', (e) =>{
          const dt = e.dataTransfer;
          const files = dt.files;
          
          if (files.length > 0){
            fileInput.files = files;
            alert(`File "${files[0].name}" uploaded successfully! AI analysis will be ready shortly.`);
          }
        });
      }

      // Initialize draggable functionality for bento cards
      if (typeof Draggable !== 'undefined'){
        const containers = document.querySelectorAll('.bento-grid');
        if (containers.length > 0){
          const sortable = new Draggable.Sortable(containers,{
            draggable: '.bento-card',
            handle: '.bento-card-header',
            mirror:{
              constrainDimensions: true,
            }
          });
          
          sortable.on('drag:start', () =>{
            document.body.classList.add('dragging');
          });
          
          sortable.on('drag:stop', () =>{
            document.body.classList.remove('dragging');
            
            // Save layout to localStorage
            const layout = Array.from(document.querySelectorAll('.bento-card')).map(card =>{
              return card.getAttribute('data-card');
            });
            localStorage.setItem('dashboardLayout', JSON.stringify(layout));
          });
        }
      }
      
    });