import numpy as np, cv2
from PIL import Image
OUT='/home/user/mysteryslavic-2026-07-19_16-47-00/presentations/office-client/assets'
SRC='src-images'   # исходники P1..P8 из ChatGPT

def hgrad(w,h,start,end,a0,a1):
    """alpha ramp across x: a0 at x=start*w -> a1 at x=end*w, clamped outside"""
    x=np.linspace(0,1,w)
    t=np.clip((x-start)/(end-start),0,1)
    a=a0+(a1-a0)*t
    return np.tile(a,(h,1))

def scrim(src,dst,color,a_left,x_end,base=0.0,bottom=None,hold=0.0):
    im=Image.open(f'{SRC}/{src}').convert('RGB')
    arr=np.asarray(im).astype(np.float32); h,w,_=arr.shape
    col=np.array(color,dtype=np.float32)
    a=hgrad(w,h,hold,x_end,a_left,0.0)
    if base: a=a+ (1-a)*base
    if bottom:
        y0,ab=bottom
        y=np.linspace(0,1,h); t=np.clip((y-y0)/(1-y0),0,1)
        ay=np.tile((t*ab)[:,None],(1,w))
        a=a+(1-a)*ay
    a=a[...,None]
    out=arr*(1-a)+col[None,None,:]*a
    Image.fromarray(out.clip(0,255).astype(np.uint8)).save(f'{OUT}/{dst}',quality=92)
    print(dst,'ok')

INK=(12,29,40); CREAM=(247,241,231)
# 01 cover: dark ramp from the left, headline sits on it
scrim('P1.jpg','ph-P1-cover.jpg',INK,0.88,0.62,base=0.10,hold=0.16)
# 02 problem: headline top-left + trigger strip along the bottom
scrim('P2.jpg','ph-P2-problem.jpg',INK,0.72,0.62,base=0.34,bottom=(0.62,0.42))
# 03 tail: light slide -> cream ramp instead of navy
scrim('P3.jpg','ph-P3-tail.jpg',CREAM,0.96,0.74,base=0.16,hold=0.30)
# 14 CTA: keep the empty office bright on the right, dark panel on the left
scrim('P7.jpg','ph-P7-cta.jpg',INK,0.95,0.54,base=0.05,hold=0.22)

# 09 item photo: crop to the card slot ratio
im=Image.open(f'{SRC}/P8.jpg').convert('RGB'); w,h=im.size
target=4.54/1.72
nh=int(w/target); top=max(0,min(h-nh,int((h-nh)*0.62)))
im.crop((0,top,w,top+nh)).save(f'{OUT}/ph-P8-chair.jpg',quality=92); print('ph-P8-chair.jpg', im.crop((0,top,w,top+nh)).size)

# 04 illustrations: knock out the flat navy so they sit on the textured slide
for src,dst in [('P4.jpg','ill-sami.png'),('P5.jpg','ill-vyvezti.png'),('P6.jpg','ill-nam.png')]:
    bgr=cv2.imread(f'{SRC}/{src}'); h,w=bgr.shape[:2]
    mask=np.zeros((h+2,w+2),np.uint8)
    for seed in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]:
        cv2.floodFill(bgr.copy(),mask,seed,(0,0,0),(30,30,30),(30,30,30),
                      4|cv2.FLOODFILL_MASK_ONLY|cv2.FLOODFILL_FIXED_RANGE|(255<<8))
    m=mask[1:-1,1:-1]
    alpha=np.where(m>0,0,255).astype(np.uint8)
    alpha=cv2.GaussianBlur(alpha,(3,3),0)
    rgba=np.dstack([cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB),alpha])
    Image.fromarray(rgba).save(f'{OUT}/{dst}')
    print(dst,'transparent px %:', round((alpha<128).mean()*100,1))
