
<nav id="navbar">
    <div class="brand-box nav-left">
        <a href="/" >
            <p class="brand-pixly-new">
                PI
                <span class="span-1">X</span>
                <span class="span-2">L</span>
                <span class="span-3">Y</span>
                <span class="span-blog">BLOG</span>
            </p>
        </a>
    </div>
    
    <div class="nav-pages nav-middle">

    </div>


</nav>
<style>
    nav#navbar{
        position: fixed;
        width: 100vw;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 20px;
        box-sizing: border-box;
        height: var(--navbar-height) !important;
        border-bottom: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid rgba(0, 0, 0, 0.2);

        transition: 0.3s;
        background-color: var(--color-dark);
        overflow-y: visible;
        box-shadow: 0 0 5px 3px rgba(0,0,0,0.1);
        z-index: 1500;
    }
    nav#navbar a {
        color:rgb(133, 134, 136);
        text-decoration: none;

    }

    p.brand-pixly-new{
        color:#cacdd0;
        background-color:#000000;
        background-color:rgba(0, 0, 0, 0);
        font-size:24px;
        line-height:26px;
        font-weight: 700;
    }
    p.brand-pixly-new .span-1{
        opacity: 0.9;
    }
    p.brand-pixly-new .span-2{
        opacity: 0.8;
    }
    p.brand-pixly-new .span-3{
        opacity: 0.7;
    }
    p.brand-pixly-new .span-blog{
        color:var(--active-color-comp-2);
    }
    

</style>

